import sys
import json
import numpy as np
from PIL import Image
import os
import time

# Suppress TensorFlow warnings yang bisa ganggu output
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
tf.get_logger().setLevel('ERROR')

def send_response(data):
    """Helper function untuk kirim response dengan proper flushing"""
    print(json.dumps(data))
    sys.stdout.flush()

def send_error(error_message):
    """Helper function untuk kirim error response"""
    result = {"status": "error", "error": str(error_message)}
    send_response(result)

try:
    # Load model .tflite
    model_path = os.path.join(os.path.dirname(__file__), 'model.tflite')
    
    if not os.path.exists(model_path):
        send_error(f"Model file not found: {model_path}")
        sys.exit(1)
    
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()

    # Ambil info input/output
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    # Load class names
    class_names_path = os.path.join(os.path.dirname(__file__), 'class_names.json')
    try:
        with open(class_names_path, 'r') as f:
            class_names = json.load(f)
        if isinstance(class_names, list):
            class_mapping = {str(i): name for i, name in enumerate(class_names)}
        else:
            class_mapping = class_names
    except Exception as e:
        # Fallback ke default class names
        class_mapping = {str(i): f"class_{i}" for i in range(22)}

except Exception as e:
    send_error(f"Error loading model: {str(e)}")
    sys.exit(1)

if __name__ == "__main__":
    try:
        # Cek arguments
        if len(sys.argv) < 3:
            send_error("Usage: python predict.py image <image_path>")
            sys.exit(1)
            
        if sys.argv[1] != "image":
            send_error("First argument must be 'image'")
            sys.exit(1)
            
        image_path = sys.argv[2]

        # Validasi file exists
        if not os.path.exists(image_path):
            send_error(f"Image file not found: {image_path}")
            sys.exit(1)

        # Info ukuran input model
        input_shape = input_details[0]['shape']
        height, width = input_shape[1], input_shape[2]
        channels = input_shape[3] if len(input_shape) > 3 else 3

        # Load dan preprocessing gambar
        try:
            image = Image.open(image_path)
            
            # Convert sesuai kebutuhan channels
            if channels == 1:
                image = image.convert('L')
            else:
                image = image.convert('RGB')
                
            # Resize image
            image = image.resize((width, height), Image.Resampling.LANCZOS)
            
            # Convert ke numpy array dan normalize
            input_data = np.array(image).astype(np.float32)
            
            # Reshape sesuai input model
            if channels == 1:
                input_data = input_data.reshape(1, height, width, 1)
            else:
                input_data = input_data.reshape(1, height, width, channels)
            
            # Normalize ke [0,1]
            input_data = input_data / 255.0
            
        except Exception as e:
            send_error(f"Error processing image: {str(e)}")
            sys.exit(1)

        # Inference
        try:
            interpreter.set_tensor(input_details[0]['index'], input_data)
            interpreter.invoke()
            output_data = interpreter.get_tensor(output_details[0]['index'])[0]
            
        except Exception as e:
            send_error(f"Error during inference: {str(e)}")
            sys.exit(1)

        # Post-processing results
        try:
            predicted_class_idx = int(np.argmax(output_data))
            predicted_prob = float(output_data[predicted_class_idx])
            predicted_label = class_mapping.get(str(predicted_class_idx), f"class_{predicted_class_idx}")

            # Top 3 predictions
            top_3_indices = np.argsort(output_data)[-3:][::-1]
            top_3_predictions = []
            
            for idx in top_3_indices:
                class_name = class_mapping.get(str(idx), f"class_{idx}")
                confidence = float(output_data[idx])
                top_3_predictions.append({
                    "class": class_name,
                    "confidence": confidence
                })

            # Prepare final result
            result = {
                "predicted_class": predicted_label,
                "confidence": predicted_prob,
                "top_3_predictions": top_3_predictions,
                "status": "success",
                "model_type": "tflite",
                "input_shape": input_shape.tolist(),
                "total_classes": len(class_mapping)
            }
            
            send_response(result)
            
        except Exception as e:
            send_error(f"Error processing results: {str(e)}")
            sys.exit(1)
            
    except Exception as e:
        send_error(f"Unexpected error: {str(e)}")
        sys.exit(1)
    
    # Small delay before exit to ensure all output is flushed
    time.sleep(0.1)
    sys.exit(0)