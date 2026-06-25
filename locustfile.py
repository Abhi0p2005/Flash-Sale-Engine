import random
from locust import HttpUser, task, between
import uuid

class FlashSaleStressTest(HttpUser):
    # Wait between 0.1 to 0.5 seconds between tasks to simulate intense clicking
    wait_time = between(0.1, 0.5)

    @task(1)
    def place_order(self):
        payload={
            "productId": 1,
            "userId": self.client.id if hasattr(self, "id") else 99,
            "idempotencyKey": str(uuid.uuid4())
        }
    @task(2)
    def test_rabbitmq_pipeline(self):
        """Simulates traffic hitting your optimized Redis + RabbitMQ endpoint"""
        user_id = random.randint(1000000, 9999999)
        self.client.post("/api/v1/checkout/redis", json={
            "productId": 1,
            "userId": user_id
        })