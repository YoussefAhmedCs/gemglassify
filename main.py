from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from PIL import Image
import io
import os
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="CNN Image Classification API",
    description="Classify gemstone images using CNN model",
    version="1.0.0"
)

# Add CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration
IMG_SIZE = (150, 150)
CLASS_NAMES = ["Emerald", "Fake_Emerald", "Fake_Ruby", "Fake_Turquoise", "Ruby", "Turquoise"]
MODEL_PATH = "models/cnn_best.keras"

# Global model variable
model = None


def create_cnn_model():
    """Create the CNN model architecture"""
    inputs = keras.Input(shape=(150, 150, 3))
    
    # Rescaling pixel values
    x = layers.Rescaling(1./255)(inputs)
    
    # Convolutional Block 1
    x = layers.Conv2D(32, 3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D()(x)
    
    # Convolutional Block 2
    x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D()(x)
    
    # Convolutional Block 3
    x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D()(x)
    
    # Convolutional Block 4
    x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
    x = layers.MaxPooling2D()(x)
    
    # Global Average Pooling
    x = layers.GlobalAveragePooling2D()(x)
    
    # Dropout
    x = layers.Dropout(0.25)(x)
    
    # Fully connected layer
    x = layers.Dense(512, activation="relu")(x)
    
    # Output Layer
    outputs = layers.Dense(6, activation='softmax')(x)
    
    model = keras.Model(inputs, outputs)
    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model


def load_model():
    """Load the trained model"""
    global model
    
    if os.path.exists(MODEL_PATH):
        print(f"Loading model from {MODEL_PATH}")
        model = keras.models.load_model(MODEL_PATH)
    else:
        print(f"Model not found at {MODEL_PATH}, creating new model")
        model = create_cnn_model()
    
    return model


def preprocess_image(image_data: bytes):
    """Preprocess image for model prediction"""
    # Open image
    img = Image.open(io.BytesIO(image_data)).convert('RGB')
    
    # Resize to model input size
    img = img.resize(IMG_SIZE)
    
    # Convert to numpy array
    img_array = np.array(img)
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array


@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    global model
    model = load_model()
    print("Model loaded successfully!")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to CNN Image Classification API",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "classes": "/classes"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.get("/classes")
async def get_classes():
    """Get list of supported classes"""
    return {
        "classes": CLASS_NAMES,
        "number_of_classes": len(CLASS_NAMES)
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict gemstone classification from uploaded image
    
    Args:
        file: Image file (JPG, PNG, etc.)
    
    Returns:
        Prediction results with class probabilities
    """
    try:
        # Check if file is an image
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]:
            raise HTTPException(status_code=400, detail="File must be an image (JPG, PNG, GIF, WEBP)")
        
        # Read file
        contents = await file.read()
        
        # Preprocess image
        img_array = preprocess_image(contents)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = CLASS_NAMES[predicted_class_idx]
        confidence = float(predictions[0][predicted_class_idx])
        
        # Prepare response with all class probabilities
        class_probabilities = {
            CLASS_NAMES[i]: float(predictions[0][i]) 
            for i in range(len(CLASS_NAMES))
        }
        
        return {
            "filename": file.filename,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "all_predictions": class_probabilities
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.post("/predict-batch")
async def predict_batch(files: list[UploadFile] = File(...)):
    """
    Predict gemstone classification for multiple images
    
    Args:
        files: List of image files
    
    Returns:
        List of prediction results
    """
    results = []
    
    for file in files:
        try:
            if file.content_type not in ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]:
                results.append({
                    "filename": file.filename,
                    "error": "File must be an image"
                })
                continue
            
            contents = await file.read()
            img_array = preprocess_image(contents)
            predictions = model.predict(img_array, verbose=0)
            predicted_class_idx = np.argmax(predictions[0])
            predicted_class = CLASS_NAMES[predicted_class_idx]
            confidence = float(predictions[0][predicted_class_idx])
            
            class_probabilities = {
                CLASS_NAMES[i]: float(predictions[0][i]) 
                for i in range(len(CLASS_NAMES))
            }
            
            results.append({
                "filename": file.filename,
                "predicted_class": predicted_class,
                "confidence": confidence,
                "all_predictions": class_probabilities
            })
        
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
