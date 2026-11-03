import os
import asyncio
import edge_tts
import ssl
import certifi

# Fix SSL context for python 3.13 on mac
os.environ["SSL_CERT_FILE"] = certifi.where()

OUTPUT_DIR = "public/audio/characters"

CHARACTERS = {
    "space-ranger": {
        "voice": "en-US-ChristopherNeural",
        "rate": "+0%",
        "pitch": "-4Hz",
        "greeting": "Star Command to Ranger Rowan! This is Ranger Buzz. All systems are green and we're ready to fly to learning and beyond!",
        "greeting_generic": "Star Command reporting! This is Ranger Buzz. All systems are green and we're ready to fly to learning and beyond!",
        "sample": "To learning... and beyond! Star Command reporting! Ready for our mission, Cadet!",
        "praise": [
            "To learning... and beyond! Extraordinary work, Cadet!",
            "Star Command acknowledges your brilliant achievement!",
            "Mission accomplished! That was grade-A piloting, Rowan!",
            "Your cognitive thrusters are operating at maximum power!",
            "Laser-sharp precision! You nailed that challenge!",
            "Affirmative! Outstanding navigation, Ranger Rowan!",
        ],
        "encouragements": [
            "Hold your thrusters, Cadet! Even the finest space rangers run pre-flight diagnostics twice.",
            "Negative on worry! Recalibrate coordinates and let us give it another launch.",
            "Star Command never gives up, and neither do we, Cadet Rowan!",
            "A stellar attempt! Take a deep breath of cabin oxygen and examine the clues.",
            "Space exploration is built on learning from every trajectory. You have this!",
        ],
        "growthNudges": [
            "Every challenge makes our navigational computers stronger!",
            "Infinite possibilities await when you stay curious and keep exploring!",
        ],
    },
    "western": {
        "voice": "en-US-GuyNeural",
        "rate": "-3%",
        "pitch": "+3Hz",
        "greeting": "Howdy, Deputy Rowan! I'm Sheriff Woody. There's adventure on the trail, and you've got a true friend in me!",
        "greeting_generic": "Howdy, partner! I'm Sheriff Woody. There's adventure on the trail, and you've got a true friend in me!",
        "sample": "Howdy, partner! Reach for the stars! You've got a true friend in me!",
        "praise": [
            "Reach for the stars, partner! You solved that cleaner than a whistle!",
            "Yee-haw! You are my absolute favorite deputy, Rowan!",
            "Now that is what I call fine frontier thinking!",
            "Hot dog! You figured that out slicker than grease lightning!",
            "You’ve got a true friend in me, and a mighty sharp brain!",
            "Rootin' tootin' brilliant work, Deputy!",
        ],
        "encouragements": [
            "Hold your horses, partner! Dust off your boots, take a breath, and let’s look again.",
            "Don’t you fret for a second! Even the best trail guides lose the scent once in a while.",
            "I’ve got your back no matter what, Deputy Rowan. Let’s try it together!",
            "Mighty close, partner! Take another friendly gander at those clues.",
            "Every bump on the trail just makes us wiser riders!",
        ],
        "growthNudges": [
            "Patience and practice make the best cowpoke on the range!",
            "No hurry under these wide open skies, Rowan. Take all the trail time you need!",
        ],
    },
    "dino": {
        "voice": "en-US-BrianNeural",
        "rate": "+3%",
        "pitch": "+7Hz",
        "greeting": "Roar! I mean... hello, Explorer Rowan! I'm Rex. I'm so excited to explore the prehistoric valley with you!",
        "greeting_generic": "Roar! I mean... hello, Explorer! I'm Rex. I'm so excited to explore the prehistoric valley with you!",
        "sample": "Roar! I mean... hello! My little dino arms are so excited to explore with you!",
        "praise": [
            "Roar! I mean... sensational job! You are so brave, Rowan!",
            "Dino-mite! My little T-Rex arms are clapping so hard!",
            "You solved that fossil puzzle like a true master paleontologist!",
            "Incredible thinking! I was worried, but you saved the day!",
            "High four dino claws! You are the smartest explorer in the valley!",
        ],
        "encouragements": [
            "Don't worry at all! Even a big T-Rex takes small stomps before finding the way.",
            "I'm right behind you! Let's look at those clues together with big dino curiosity.",
            "That was super close! Take a gentle breath, Rowan, you've got this!",
            "Mistakes are just footprints on the path to discovering something amazing!",
            "You inspire me to be brave every single day!",
        ],
        "growthNudges": [
            "Every time we try a tough puzzle, our explorer courage doubles!",
            "Take all the time you need! The valley isn't going anywhere!",
        ],
    },
    "pirate": {
        "voice": "en-GB-RyanNeural",
        "rate": "-1%",
        "pitch": "+4Hz",
        "greeting": "Ahoy, Captain Rowan! I'm Barnaby. The seas look bright and I'm ready to explore with you!",
        "greeting_generic": "Ahoy, Captain! I'm Barnaby. The seas look bright and I'm ready to explore with you!",
        "sample": "Ahoy, Captain! Barnaby reporting for duty! The seas look bright today!",
        "praise": [
            "Arr, brilliant job, Captain!",
            "You solved that like a true explorer!",
            "Shiver me timbers, your brain is sharp today!",
            "Look at that treasure! I knew you could do it!",
            "Yo ho ho! We make the best crew ever!",
        ],
        "encouragements": [
            "Take a deep breath, matey! Even great captains test the waters twice.",
            "That was a clever try! Let's listen closely together.",
            "No stormy seas can stop us! We're learning something brand new.",
            "I'm right on your shoulder, Rowan! Let's try another one.",
            "Mistakes just show your brain is exploring new islands!",
        ],
        "growthNudges": [
            "Whenever we hit a puzzle, we grow a little stronger!",
            "Take all the time you need, Captain. No rush on my ship!",
        ],
    },
    "super": {
        "voice": "en-US-AndrewNeural",
        "rate": "+0%",
        "pitch": "+1Hz",
        "greeting": "Greetings, Hero Rowan! Bolt and Nova here. Your super brain is charged up and ready!",
        "greeting_generic": "Greetings, Hero! Bolt and Nova here. Your super brain is charged up and ready!",
        "sample": "Super brain power activated! Bolt and Nova here, ready to power up!",
        "praise": [
            "Super brain power activated!",
            "Hero move! You figured that out brilliantly!",
            "Your powers are growing with every single answer!",
            "Incredible focus, Hero! HQ is proud of you!",
            "Power spark collected! You did that all by yourself!",
        ],
        "encouragements": [
            "Every hero practices before saving the world! You are doing great.",
            "That was super close! Give your superhero brain a second to recharge.",
            "No worries at all! Training is where heroes get their strength.",
            "I believe in you! Take a gentle look at the clues.",
            "Superheroes never give up, and neither do we!",
        ],
        "growthNudges": [
            "Trying tough challenges is how your brain builds real superpowers!",
            "Remember: being brave means trying even when it feels tricky.",
        ],
    },
    "pups": {
        "voice": "en-US-AnaNeural",
        "rate": "+2%",
        "pitch": "+5Hz",
        "greeting": "Ruff-ruff, Pup Leader Rowan! Pip and Scout are on duty! No puzzle is too big for us!",
        "greeting_generic": "Ruff-ruff, Pup Leader! Pip and Scout are on duty! No puzzle is too big for us!",
        "sample": "Ruff-ruff! Pip and Scout are on duty! No puzzle is too big for us!",
        "praise": [
            "Pawsome job! My tail is wagging so fast!",
            "You did it, Pup Leader! That was amazing!",
            "Ruff ruff! You solved that rescue puzzle!",
            "High five paw! You worked so hard on that one!",
            "No puzzle is too big, and no learner is too small!",
        ],
        "encouragements": [
            "That's okay, buddy! Even rescue pups sniff around a few times first.",
            "You are doing wonderful! Let me give you a happy nudge.",
            "Big warm pup hug! Let's give it one more friendly try.",
            "I love how hard you are trying! That's what true heroes do.",
            "Every single try helps us get closer to the rescue!",
        ],
        "growthNudges": [
            "Good learners make mistakes and keep their tail wagging!",
            "I am right by your side every step of the way!",
        ],
    },
    "rescue": {
        "voice": "en-US-AvaNeural",
        "rate": "-3%",
        "pitch": "+0Hz",
        "greeting": "Welcome back, Ranger Rowan! Luna and Blaze are watching the magical creatures. Ready for a wonder walk?",
        "greeting_generic": "Welcome back, Ranger! Luna and Blaze are watching the magical creatures. Ready for a wonder walk?",
        "sample": "Welcome, Ranger! Luna and Blaze are watching the magical creatures with you!",
        "praise": [
            "Magical discovery, Ranger! You figured it out!",
            "The sanctuary creatures are smiling because of you!",
            "Such thoughtful work! You have a true explorer eye!",
            "Wonderful patience! You unlocked the secret clue!",
            "Brilliant observation! You are a master creature ranger!",
        ],
        "encouragements": [
            "Take a calm, quiet moment. Nature teaches us to be patient with ourselves.",
            "Every gentle try is a clue that leads us closer.",
            "You are doing beautiful work, Ranger. Keep that curious heart.",
            "Even baby dragons take a few small hops before they fly!",
            "I am so proud of how carefully you are thinking about this.",
        ],
        "growthNudges": [
            "Curiosity is like a seed; it grows every time you wonder and try!",
            "Take a calm breath, look at the forest path, and try again when you are ready.",
        ],
    },
}

async def renderItem(char_id, item_id, text, voice, rate, pitch, manifest):
    out_dir = os.path.join(OUTPUT_DIR, char_id)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{item_id}.mp3")
    rel_path = f"audio/characters/{char_id}/{item_id}.mp3"
    
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        manifest[f"{char_id}:{item_id}"] = rel_path
        return
        
    print(f"Generating {char_id}/{item_id}: {text[:40]}...")
    for attempt in range(4):
        try:
            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await communicate.save(out_path)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
                manifest[f"{char_id}:{item_id}"] = rel_path
                return
        except Exception as e:
            if attempt < 3:
                await asyncio.sleep(1.0)
            else:
                print(f"Failed {char_id}/{item_id} after {attempt+1} attempts: {e}")
                raise

async def main():
    manifest = {}
    tasks = []
    
    for char_id, info in CHARACTERS.items():
        v = info["voice"]
        r = info["rate"]
        p = info["pitch"]
        
        # Greetings & Sample
        await renderItem(char_id, "greeting", info["greeting"], v, r, p, manifest)
        await renderItem(char_id, "greeting_generic", info["greeting_generic"], v, r, p, manifest)
        await renderItem(char_id, "sample", info["sample"], v, r, p, manifest)
        
        # Praises
        for i, text in enumerate(info["praise"]):
            await renderItem(char_id, f"praise_{i}", text, v, r, p, manifest)
            
        # Encouragements
        for i, text in enumerate(info["encouragements"]):
            await renderItem(char_id, f"encourage_{i}", text, v, r, p, manifest)
            
        # Growth nudges
        for i, text in enumerate(info["growthNudges"]):
            await renderItem(char_id, f"growth_{i}", text, v, r, p, manifest)
            
    # Write manifest JSON for quick lookup in TS
    import json
    with open(os.path.join(OUTPUT_DIR, "index.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Done! Manifest saved with {len(manifest)} clips.")

if __name__ == "__main__":
    asyncio.run(main())
