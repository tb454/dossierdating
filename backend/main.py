from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import asyncio
import httpx

app = FastAPI(title="Dossier Dating API")

# In-memory stores
USERS: Dict[int, Dict] = {}
DATES: List[Dict] = []
REVIEWS: List[Dict] = []
_next_user_id = 1
_next_date_id = 1

# Models
class DossierUser(BaseModel):
    name: str

class DossierDate(BaseModel):
    user1: int
    user2: int

class DossierReview(BaseModel):
    date_id: int
    scores: Dict[str, int]
    comment: Optional[str]

@app.post("/dossier/register")
def register_user(user: DossierUser):
    global _next_user_id
    uid = _next_user_id
    USERS[uid] = {"id": uid, "name": user.name}
    _next_user_id += 1
    return {"id": uid}

@app.post("/dossier/create_date")
def create_date(data: DossierDate):
    global _next_date_id
    if data.user1 not in USERS or data.user2 not in USERS:
        raise HTTPException(404, "User not found")
    did = _next_date_id
    DATES.append({"id": did, "user1": data.user1, "user2": data.user2})
    _next_date_id += 1
    return {"date_id": did}

@app.post("/dossier/submit_review")
def submit_review(review: DossierReview):
    REVIEWS.append({"date_id": review.date_id, "scores": review.scores, "comment": review.comment})
    return {"status": "ok"}

@app.get("/dossier/stats")
def get_stats():
    return {"users": len(USERS), "dates": len(DATES), "reviews": len(REVIEWS)}

# Optional bot simulation
async def simulate_user(idx: int):
    async with httpx.AsyncClient() as client:
        r = await client.post("http://localhost:8000/dossier/register", json={"name": f"bot{idx}"})
        uid = r.json()["id"]
        partner = (uid % _next_user_id) or uid
        rd = await client.post("http://localhost:8000/dossier/create_date", json={"user1": uid, "user2": partner})
        did = rd.json()["date_id"]
        await client.post("http://localhost:8000/dossier/submit_review", json={
            "date_id": did,
            "scores": {"first_impression": 5},
            "comment": "Solid date."
        })

async def run_sim():
    tasks = [simulate_user(i) for i in range(10000)]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(run_sim())
