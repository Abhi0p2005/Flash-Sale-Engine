from locust import HttpUser, task, between
import random

class FlashSaleUser(HttpUser):
    # Simulates a user waiting between 0.1 to 0.5 seconds between clicks
    wait_time = between(0.1, 0.5)

    @task
    def buy_product(self):
        # Generates a random userId so you can test concurrent database writes realistically
        random_user_id = random.randint(100, 100000)
        
        payload = {
            "productId": 1,
            "userId": random_user_id
        }
        
        self.client.post("/api/v1/checkout/redis", json=payload)