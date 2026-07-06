import random
from locust import HttpUser, task, between

class FlashSaleUser(HttpUser):
    # Frantic clicking behavior during a live flash sale
    wait_time = between(0.05, 0.2)

    # # === TEST 1: PESSIMISTIC LOCKING ===
    @task
    def test_pessimistic(self):
        user_id = random.randint(1000, 9999)
        product_id = 102
        url = f"/api/v1/checkout/pessimistic?productId={product_id}&userId={user_id}"
        
        with self.client.post(url, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif "sold out" in response.text.lower() or response.status_code == 400:
                response.success()
            else:
                response.failure(f"Pessimistic Error: {response.status_code} - {response.text}")

    # === TEST 2: OPTIMISTIC LOCKING ===
    # (Uncomment this and comment out the others when testing Optimistic)
    # @task
    # def test_optimistic(self):
    #     user_id = random.randint(1000, 9999)
    #     product_id = 102
    #     # Adjust this path if your optimistic endpoint has a slightly different mapping name
    #     url = f"/api/v1/checkout/optimistic?productId={product_id}&userId={user_id}"
        
    #     with self.client.post(url, catch_response=True) as response:
    #         if response.status_code == 200:
    #             response.success()
    #         elif "version" in response.text.lower() or response.status_code == 409:
    #             # Optimistic locking version mismatches are recorded as standard behaviors
    #             response.success()
    #         else:
    #             response.failure(f"Optimistic Error: {response.status_code}")

    # === TEST 3: REDIS + LUA + RABBITMQ ===
    # (Uncomment this and comment out the others when testing Redis Async Pipeline)
    # === TEST 3: REDIS + LUA + RABBITMQ ===
    # @task
    # def test_redis_pipeline(self):
    #     user_id = random.randint(1000, 9999)
    #     product_id = 102
    #     url = f"/api/v1/checkout/redis?productId={product_id}&userId={user_id}"
        
    #     with self.client.post(url, catch_response=True) as response:
    #         # 200 OK means stock was claimed and queued
    #         if response.status_code == 200:
    #             response.success()
    #         # 409 Conflict means an expected business rule validation occurred
    #         elif response.status_code == 409:
    #             response.success()
    #         else:
    #             response.failure(f"Redis Unexpected Error: {response.status_code} - {response.text}")