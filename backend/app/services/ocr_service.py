import cv2
import pytesseract


def extract_text(image):

    """
    Extract text from a preprocessed OpenCV image.

    The image is supplied directly in memory.
    No temporary image file is created or stored here.
    """

    if image is None:
        raise ValueError(
            "No image supplied for OCR."
        )

    text = pytesseract.image_to_string(
        image
    )

    return text