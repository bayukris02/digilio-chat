import os
import logging
from minio import Minio
from paddleocr import PaddleOCR
from io import BytesIO

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        # MinIO Setup
        self.minio_client = Minio(
            os.getenv("MINIO_ENDPOINT", "localhost:9000"),
            access_key=os.getenv("MINIO_ROOT_USER", "minioadmin"),
            secret_key=os.getenv("MINIO_ROOT_PASSWORD", "minioadmin"),
            secure=False
        )
        self.bucket_name = "digilio-ocr"
        self._ensure_bucket()
        
        # PaddleOCR Setup (Lazy initialization to save memory if not used)
        self._ocr = None

    def _ensure_bucket(self):
        if not self.minio_client.bucket_exists(self.bucket_name):
            self.minio_client.make_bucket(self.bucket_name)

    @property
    def ocr(self):
        if self._ocr is None:
            # lang='id' for Indonesian support
            self._ocr = PaddleOCR(use_angle_cls=True, lang='id', show_log=False)
        return self._ocr

    async def process_file(self, file_content: bytes, file_name: str) -> str:
        """Upload to MinIO and Extract Text using PaddleOCR"""
        try:
            # 1. Upload to MinIO
            file_data = BytesIO(file_content)
            self.minio_client.put_object(
                self.bucket_name,
                file_name,
                file_data,
                len(file_content)
            )
            logger.info(f"File {file_name} uploaded to MinIO.")

            # 2. Extract Text
            # PaddleOCR expects a file path or numpy array. 
            # We'll save it temporarily or pass it directly if supported.
            # For simplicity, let's write to a temp file.
            temp_path = f"/tmp/{file_name}"
            with open(temp_path, "wb") as f:
                f.write(file_content)
            
            result = self.ocr.ocr(temp_path, cls=True)
            
            # PaddleOCR result is a list of lists: [[ [box, (text, score)], ... ]]
            extracted_text = ""
            for idx in range(len(result)):
                res = result[idx]
                if res:
                    for line in res:
                        extracted_text += line[1][0] + " "
            
            # Cleanup
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            return extracted_text.strip()
            
        except Exception as e:
            logger.error(f"OCR Processing Error: {e}")
            raise e

ocr_service = OCRService()
