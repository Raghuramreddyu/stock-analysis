import pytesseract
import cv2


def extract_text(image_path: str):

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Could not read image")

    text = pytesseract.image_to_string(image)

    return text