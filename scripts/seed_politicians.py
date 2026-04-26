"""
One-time seed script — migrates politicians.ts data into MongoDB `politicians` collection.

Usage:
    MONGODB_URI=mongodb://localhost:27017 python scripts/seed_politicians.py

Field mapping from politicians.ts:
    _id    <- id
    name   <- name
    party  <- party  (R / D / I)
    state  <- district  (closest available field; PoliFigure names it `state`)
    office <- role
    vector <- vector_actual  (20D legislative vector used for inference)

Display-only fields (photo, bio, donors, w, region, vector_stated) are omitted —
the backend only needs the inference vector; the frontend serves the rest from politicians.ts.
"""

import os
import sys

import pymongo

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")

# ---------------------------------------------------------------------------
# Seed data — extracted from frontend/deskApp/src/features/poliweb/data/politicians.ts
# vector = vector_actual (legislative record), cast to float
# ---------------------------------------------------------------------------

POLITICIANS = [
    {
        "_id": "bd-fl19", "name": "Byron Donalds", "party": "R",
        "state": "FL-19", "office": "U.S. House",
        "vector": [3.0,4.0,3.0,5.0,5.0,5.0,4.0,5.0,5.0,2.0,5.0,5.0,5.0,4.0,4.0,5.0,5.0,5.0,5.0,3.0],
    },
    {
        "_id": "jc-fl15", "name": "Jay Collins", "party": "R",
        "state": "FL-Sen-14", "office": "State Senate",
        "vector": [3.0,3.0,3.0,3.0,4.0,4.0,3.0,4.0,3.0,3.0,4.0,4.0,3.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0],
    },
    {
        "_id": "am-flag", "name": "Ashley Moody", "party": "R",
        "state": "FL-Sen", "office": "Statewide",
        "vector": [4.0,3.0,3.0,3.0,4.0,5.0,5.0,4.0,4.0,2.0,4.0,5.0,2.0,4.0,3.0,4.0,3.0,5.0,4.0,4.0],
    },
    {
        "_id": "rs-flgov", "name": "Ron DeSantis", "party": "R",
        "state": "FL-Gov", "office": "Governor",
        "vector": [4.0,4.0,4.0,3.0,5.0,5.0,5.0,4.0,3.0,2.0,5.0,5.0,2.0,4.0,3.0,4.0,4.0,5.0,4.0,5.0],
    },
    {
        "_id": "rs-flsen", "name": "Rick Scott", "party": "R",
        "state": "FL-Sen", "office": "U.S. Senate",
        "vector": [5.0,5.0,5.0,4.0,4.0,4.0,4.0,4.0,3.0,3.0,4.0,5.0,3.0,4.0,3.0,4.0,5.0,4.0,4.0,4.0],
    },
    {
        "_id": "mr-flsen", "name": "Marco Rubio", "party": "R",
        "state": "FL-Sen", "office": "U.S. Senate",
        "vector": [4.0,4.0,4.0,3.0,4.0,4.0,5.0,4.0,3.0,3.0,5.0,5.0,3.0,3.0,3.0,4.0,4.0,5.0,3.0,4.0],
    },
    {
        "_id": "mw-fl23", "name": "Debbie Wasserman Schultz", "party": "D",
        "state": "FL-25", "office": "U.S. House",
        "vector": [2.0,2.0,2.0,2.0,1.0,2.0,1.0,2.0,1.0,2.0,3.0,3.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0],
    },
    {
        "_id": "fc-fl20", "name": "Frederica Wilson", "party": "D",
        "state": "FL-24", "office": "U.S. House",
        "vector": [1.0,2.0,1.0,2.0,1.0,1.0,1.0,2.0,1.0,1.0,2.0,3.0,1.0,1.0,1.0,2.0,2.0,2.0,1.0,2.0],
    },
    {
        "_id": "ms-fl09", "name": "Maxwell Frost", "party": "D",
        "state": "FL-10", "office": "U.S. House",
        "vector": [2.0,2.0,2.0,1.0,2.0,2.0,1.0,1.0,1.0,1.0,2.0,2.0,1.0,1.0,1.0,2.0,2.0,2.0,1.0,1.0],
    },
    {
        "_id": "kc-fl14", "name": "Kathy Castor", "party": "D",
        "state": "FL-14", "office": "U.S. House",
        "vector": [2.0,2.0,2.0,2.0,2.0,2.0,1.0,2.0,1.0,2.0,2.0,3.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0],
    },
    {
        "_id": "mw-flsd17", "name": "Lori Berman", "party": "D",
        "state": "FL-Sen-26", "office": "State Senate",
        "vector": [2.0,3.0,2.0,2.0,2.0,2.0,1.0,3.0,1.0,2.0,2.0,3.0,2.0,2.0,2.0,3.0,2.0,3.0,2.0,2.0],
    },
    {
        "_id": "rs-fl08", "name": "Bill Posey", "party": "R",
        "state": "FL-8", "office": "U.S. House",
        "vector": [4.0,4.0,4.0,4.0,4.0,4.0,4.0,5.0,3.0,4.0,4.0,5.0,3.0,4.0,3.0,4.0,4.0,4.0,4.0,4.0],
    },
    {
        "_id": "ms-fl01", "name": "Matt Gaetz", "party": "R",
        "state": "FL-1", "office": "U.S. House",
        "vector": [5.0,4.0,4.0,5.0,5.0,5.0,5.0,5.0,4.0,3.0,5.0,4.0,4.0,5.0,4.0,4.0,5.0,5.0,5.0,5.0],
    },
    {
        "_id": "as-fl04", "name": "Aaron Bean", "party": "R",
        "state": "FL-4", "office": "U.S. House",
        "vector": [4.0,4.0,4.0,4.0,5.0,4.0,5.0,4.0,4.0,3.0,4.0,5.0,3.0,4.0,3.0,4.0,4.0,5.0,4.0,4.0],
    },
    {
        "_id": "vs-fl27", "name": "Maria Salazar", "party": "R",
        "state": "FL-27", "office": "U.S. House",
        "vector": [4.0,4.0,3.0,3.0,4.0,4.0,4.0,3.0,3.0,3.0,5.0,4.0,3.0,3.0,3.0,3.0,3.0,4.0,3.0,3.0],
    },
    {
        "_id": "cm-fl26", "name": "Carlos Gimenez", "party": "R",
        "state": "FL-28", "office": "U.S. House",
        "vector": [4.0,4.0,4.0,3.0,4.0,4.0,4.0,4.0,3.0,3.0,5.0,4.0,3.0,4.0,3.0,4.0,4.0,4.0,4.0,3.0],
    },
    {
        "_id": "ds-fl17", "name": "Scott Franklin", "party": "R",
        "state": "FL-18", "office": "U.S. House",
        "vector": [4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,3.0,5.0,5.0,3.0,4.0,3.0,4.0,4.0,4.0,4.0,4.0],
    },
    {
        "_id": "mw-fl05", "name": "John Rutherford", "party": "R",
        "state": "FL-5", "office": "U.S. House",
        "vector": [4.0,4.0,4.0,4.0,4.0,4.0,5.0,5.0,4.0,4.0,4.0,5.0,3.0,4.0,3.0,4.0,4.0,5.0,4.0,4.0],
    },
    {
        "_id": "kc-fl11", "name": "Daniel Webster", "party": "R",
        "state": "FL-11", "office": "U.S. House",
        "vector": [4.0,4.0,4.0,4.0,4.0,4.0,5.0,4.0,3.0,4.0,4.0,4.0,3.0,4.0,4.0,4.0,4.0,4.0,4.0,5.0],
    },
    {
        "_id": "lf-fl22", "name": "Lois Frankel", "party": "D",
        "state": "FL-22", "office": "U.S. House",
        "vector": [2.0,2.0,2.0,2.0,2.0,2.0,1.0,2.0,1.0,2.0,2.0,3.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0],
    },
    {
        "_id": "cd-fl12", "name": "Sheila Cherfilus-McCormick", "party": "D",
        "state": "FL-20", "office": "U.S. House",
        "vector": [2.0,2.0,2.0,2.0,1.0,2.0,1.0,1.0,1.0,1.0,2.0,2.0,1.0,1.0,2.0,1.0,2.0,2.0,1.0,1.0],
    },
    {
        "_id": "jm-fl13", "name": "Anna Paulina Luna", "party": "R",
        "state": "FL-13", "office": "U.S. House",
        "vector": [5.0,4.0,4.0,4.0,5.0,5.0,5.0,5.0,4.0,3.0,5.0,5.0,4.0,5.0,4.0,4.0,5.0,5.0,4.0,5.0],
    },
    {
        "_id": "vs-fl16", "name": "Vern Buchanan", "party": "R",
        "state": "FL-16", "office": "U.S. House",
        "vector": [5.0,5.0,5.0,4.0,4.0,4.0,4.0,4.0,3.0,3.0,4.0,4.0,3.0,4.0,3.0,4.0,4.0,4.0,4.0,4.0],
    },
    {
        "_id": "ms-fl06", "name": "Mike Waltz", "party": "R",
        "state": "FL-6", "office": "U.S. House",
        "vector": [4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,3.0,3.0,5.0,5.0,3.0,4.0,3.0,4.0,4.0,5.0,4.0,4.0],
    },
    {
        "_id": "ds-fl21", "name": "Brian Mast", "party": "R",
        "state": "FL-21", "office": "U.S. House",
        "vector": [4.0,4.0,4.0,4.0,4.0,4.0,5.0,5.0,3.0,3.0,5.0,5.0,3.0,4.0,3.0,4.0,4.0,5.0,4.0,4.0],
    },
    {
        "_id": "vs-fl07", "name": "Cory Mills", "party": "R",
        "state": "FL-7", "office": "U.S. House",
        "vector": [5.0,4.0,4.0,4.0,5.0,5.0,5.0,5.0,4.0,3.0,5.0,5.0,4.0,4.0,3.0,4.0,5.0,5.0,4.0,5.0],
    },
    {
        "_id": "ds-flag2", "name": "James Uthmeier", "party": "R",
        "state": "FL-AG", "office": "Statewide",
        "vector": [4.0,4.0,4.0,4.0,5.0,5.0,5.0,4.0,4.0,3.0,4.0,5.0,2.0,5.0,3.0,4.0,3.0,5.0,4.0,4.0],
    },
    {
        "_id": "cs-flsen", "name": "Tracie Davis", "party": "D",
        "state": "FL-Sen-5", "office": "State Senate",
        "vector": [2.0,2.0,2.0,2.0,2.0,2.0,1.0,2.0,1.0,2.0,2.0,3.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0],
    },
    {
        "_id": "mp-flsen", "name": "Shevrin Jones", "party": "D",
        "state": "FL-Sen-34", "office": "State Senate",
        "vector": [2.0,2.0,2.0,2.0,1.0,2.0,1.0,2.0,1.0,1.0,2.0,3.0,1.0,1.0,2.0,2.0,2.0,2.0,1.0,2.0],
    },
    {
        "_id": "ds-flhs2", "name": "Daniel Perez", "party": "R",
        "state": "FL-Hs-116", "office": "State House",
        "vector": [4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,3.0,3.0,4.0,4.0,3.0,4.0,3.0,4.0,4.0,4.0,4.0,4.0],
    },
    {
        "_id": "ds-flhs3", "name": "Anna Eskamani", "party": "D",
        "state": "FL-Hs-42", "office": "State House",
        "vector": [1.0,2.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,2.0,2.0,1.0,1.0,1.0,1.0,2.0,2.0,1.0,1.0],
    },
    {
        "_id": "ml-flsen", "name": "Joe Gruters", "party": "R",
        "state": "FL-Sen-22", "office": "State Senate",
        "vector": [5.0,5.0,5.0,4.0,5.0,5.0,5.0,4.0,4.0,3.0,5.0,5.0,3.0,4.0,3.0,4.0,5.0,5.0,4.0,5.0],
    },
]


def main():
    client = pymongo.MongoClient(MONGODB_URI)
    collection = client["civic_info"]["politicians"]

    seeded = 0
    for doc in POLITICIANS:
        collection.replace_one({"_id": doc["_id"]}, doc, upsert=True)
        seeded += 1

    print(f"Seeded {seeded} politicians")
    client.close()


if __name__ == "__main__":
    main()
