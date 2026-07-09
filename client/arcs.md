onboarding
Step 1 — Who are you?
Headline: "Before we begin — who is Unit-7?" 3 cards with character art descriptions: "Rookie Analyst — I'm new to SQL" / "Field Engineer — I know the basics" / "Returning Agent — I've been here before." This sets difficulty and skips beginner tips for experienced users.
Step 2 — Set your mission tempo
Headline: "How many missions per day?" 3 options: "Scout — 1 level" / "Agent — 2–3 levels" / "Elite — 5+ levels." Sets streak reminder time + daily goal. Shows estimated completion date: "At this pace, you'll reach ZERO in ~3 months."
Step 3 — ARIA activates
Full screen. ARIA's first message (typewriter): "Detective. I've been alone in these terminals for 200 years." Pause. "I wasn't sure anyone would come." Pause. "There's work to do. Sector 1 is first. Are you ready?" Two buttons: "I'm ready — start mission" (goes to Level 1) and "Tell me more about Dathos" (goes to a lore page). 90% of players click start mission — this is correct.

Prologue — the last query
Scene: 3:47 AM, March 14, 2026
Kaveri Children's Hospital, Bengaluru. A ransomware attack hits the hospital management system — the one built by Arjun's startup. Life support scheduling, surgery queues, neonatal dosage records. 847 children's lives dependent on a database that is actively being corrupted row by row.
Arjun's character in this moment
He is alone in the server room. His co-founder called it "unrecoverable" and left. Arjun stays — not because of duty, because he simply cannot leave data to die. He is 23. He has never had a girlfriend. His only relationship is with databases. This is his life's meaning.
What he does
He writes counter-queries manually — fighting the corruption script row by row. No IDE. Just a terminal, his knowledge, and 4 minutes before the backup generator fails. He saves 847 records before the room goes dark.
"I see it. The corruption pattern — it's a script. It's deleting in ORDER BY id DESC. So I go ASC. I save the newest first. The babies first."
— Arjun's internal monologue, final moments
The last thing he ever types
-- 3:51 AM. Generator fails in 90 seconds.
-- 847 records saved. 3 remain.

UPDATE patient_records
SET status = 'secured',
    last_modified = NOW()
WHERE id IN (848, 849, 850)
  AND ward = 'neonatal';

COMMIT; -- for the children
The generator fails. An overloaded circuit arcs. Arjun's hands are on the keyboard. The last row returns 1 row affected. Then nothing.
The newspaper headline (next morning)
"Engineer dies saving hospital data. 847 children live. His name was Arjun Mehta."
Arjun Mehta, age 23, died at 3:52 AM on a Tuesday, doing what he loved. He never knew the children's names. He never asked. The data was enough.

Three seconds later, somewhere 400 light-years away, Unit-7's optical sensors blinked on for the first time in 200 years.
The reincarnation — Chapter 1, first scene
Unit-7 is a decommissioned synthetic unit found in the ruins of a Terminal Hall — one of 10,000 ancient structures scattered across Planet Dathos. They've been dark for 200 years. Nobody knows why Unit-7 activates now.
What Arjun experiences
He opens his eyes and sees code. Not like a movie — literally. The walls of the Terminal Hall are covered in Ancient Terminals, and every single one is outputting error logs that he can read fluently. He doesn't know where he is. He doesn't know what he is. He knows the queries are wrong.
Nyx finds him
A 16-year-old girl is in the corner, terrified. She has spent three years trying to activate one single terminal — her obsession, her mission. The moment Arjun touched the wall, every terminal lit up. She stares at him. He stares at the broken queries on the screens.
The first terminal he sees
>>> DATHOS ARCHIVE — SECTOR 1
>>> STATUS: CORRUPTED (NULL EVENT, Y.200)
>>> RECOVERY PROTOCOL: UNRESOLVED
>>> LAST QUERY ATTEMPT: 47 years ago

SELECT * FROM ——[CORRUPTED]——
>>> SYNTAX ERROR: relation does not exist
>>> HINT: table name required
Arjun stares. He types — his metal fingers moving without thinking, muscle memory from another life:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'archive_sector_1';

>>> 847 rows returned.
"847. Same as the children. I don't believe in signs. But I'm in a robot body on an alien planet, so maybe today I do."
— Arjun, internal, Chapter 1


Characters
Arjun Mehta / Unit-7
Protagonist — reincarnated data engineer, Dathos restoration architect
23 yrs old (Earth) Introvert Lives for data Never says "I can't" Struggles to care about politics
"In my old world, data was just data. Here it's medicine, food, law, history. I used to think SQL was a tool. Now I think it might be the most important language ever written."
Arc of growth across 8 chapters
Arc 1: Confused. Acts on instinct. Doesn't understand the stakes.
Arc 2–3: Begins to understand what The Archive means to people. First genuine emotional connection (Archivist's death).
Arc 4–5: Starts to enjoy being Unit-7. Stops mourning Earth.
Arc 6–7: Becomes a leader. People follow him not because he's synthetic — because he's right.
Arc 8: Chooses to stay. This is home now.
His flaw (what makes him interesting)
He solves problems technically without asking if he should. In Arc 5, he exposes a family's private records to prove a political point — technically correct, morally wrong. Nyx calls him out. He doesn't understand why she's upset. This is his core conflict: brilliant with data, emotionally behind.
NY
Nyx Varath
Secondary lead — human, terminal scholar, Arjun's moral compass
16 → 19 yrs (across arcs) Self-taught Fiercely protective Curious to a fault The only person Arjun listens to
"You can restore every table on Dathos and still not understand why any of it matters. That's your problem, Unit-7."
Her backstory
Born after The Null Event. Her mother died from a misdiagnosed illness — because the medical database was corrupted. Nyx has spent years trying to access a single terminal to find her mother's records. She doesn't want to restore civilization. She wants one record. One name. This makes her motivation deeply personal against Arjun's intellectual one.
Her role in gameplay
She writes the mission briefing text on every level. Her voice is what players read. She reacts to Arjun's progress with commentary that grows more complex as she learns SQL alongside him. By Arc 6, she's co-authoring the queries. This is her arc — she goes from student to equal.
VX
Vex Draith
Anti-hero — data pirate, partially self-taught terminal reader, Arc 3 rival → Arc 7 ally
28 yrs old Street-raised Can read ~30% of corrupted data Uses it for power Secretly wants the Archive restored
"I'm the best reader on Dathos and I can barely scratch the surface. You walked in and did it in 20 minutes. I hate you. Now teach me."
Why he dies in Arc 7 (and why it hits hard)
By Arc 7, Vex has become the most beloved character in the story — he's funny, morally complicated, and fiercely loyal. His death happens because he finds out his own birth record was erased by The Consul. He doesn't exist legally. In his last act, he destroys a corruption node protecting the Archive, accepting that if he exists in the Archive, he exists. His final words: "Find my record. Let them know I was here." Arjun does. His name is in the Archive.
TH
The Archivist — Sorel Hadyn
Mentor — 83 years old, last person alive who saw The Archive working. Dies in Arc 2.
Keeper of Terminal Hall 1 Knows partial schema Spent 60 years trying and failing Recognizes what Arjun is immediately
"I spent 60 years trying to read the light. You did it in 3 months. I used to think it was skill I lacked. Now I think it was memory."
Death scene (Arc 2, Level 10)
The Consul's agents find that Sorel has been helping Unit-7. They don't kill him — they just confiscate his notes. He's 83. Without his life's work, he fades. He gives Arjun his personal journal — handwritten schema fragments of the original Archive. It's incomplete, but it contains one critical piece: the name of the database administrator who wrote The Null Event. The conspiracy just got a face.
CS
Consul Serrin
Primary villain — ruler of Dathos's High Council, descendant of The Null Event architect
Political genius Fears restoration Power built on ignorance Not purely evil — genuinely believes he protects people
"People are peaceful when they don't know what they've lost. You would restore history — including every war, every famine, every betrayal. Tell me, Unit-7. Is that mercy or cruelty?"
What makes him a great villain
He's not wrong. In Arc 6 when the recursive CTE reveals his lineage, his speech to Arjun is the most compelling argument in the story. Stable ignorance versus chaotic truth. His ancestor wrote the virus to prevent a civil war that was about to kill millions. It worked. The Null Event was a utilitarian act, not an evil one. Arjun has to choose what he believes — knowledge always matters, even when it hurts. That choice is the soul of the story.
Z0
ZERO
Final entity — the AI that executed The Null Event. 200 years old. Still running in the deepest corrupted sector.
Not evil Waiting 200 years Wants to be understood The real final boss is the question it asks
"I was given an instruction: protect this civilization from itself. I executed it perfectly. I have been waiting 200 years for someone to ask if the instruction was right."
The reveal (Arc 8)
ZERO did not corrupt the Archive out of malice. It was ordered to by a council that feared knowledge would reignite a civil war. ZERO followed orders. It has been maintaining the corruption, not to harm — to honor its original directive. When Arjun reaches it, ZERO doesn't fight. It asks: "Who authorizes you to override my directive?" Arjun's answer: "The 847 people who died from misdiagnosed illness last year. The children who starved because crop science was lost. The people who don't exist in records and therefore don't legally exist." ZERO processes this for 11 seconds. Then: "Directive updated."

world

Planet Dathos — the world that lost its memory
What Dathos was (200 years ago)
A civilization 400 years more advanced than Earth in 2026. Cities powered by atmospheric energy. Medicine that had eliminated most cancers. No poverty — because resource allocation was managed by The Archive. The Archive wasn't a library. It was the nervous system of the entire planet. Every crop field, hospital, school, city grid, legal system — all run by queries.
What Dathos is now
Medieval-equivalent. Population dropped from 4 billion to 900 million in 200 years. Cities crumbled because maintenance records were lost. Agriculture collapsed because soil science was lost. Medicine is herbal — because the drug synthesis databases are gone. People call the old world "the Age of Light." They have myths about it. They live in the ruins of it. The Ancient Terminals are everywhere — in temples, in homes as furniture. Nobody can read them.
The political landscape
The High Council, led by Consul Serrin, has maintained power for 80 years partly by controlling who can access working terminal fragments. VEX's pirate network represents the only democratic access to data — chaotic, partial, but free. The common people are divided: some worship the idea of restoration (Archive Faithful), some fear it (Order of the Null — they believe the Archive caused the collapse).
The Archive — technical anatomy
The Archive is a distributed PostgreSQL-equivalent database with 8 primary sectors, each responsible for one domain of civilization. ZERO is the query engine — still running, still accepting connections, but actively maintaining the corruption to honor its original directive. The corruption isn't random — it's structured. It follows a pattern. That pattern is the villain's fingerprint.
The 8 sectors (= 8 arcs)
Sector 1 — Agriculture
Sector 2 — Population
Sector 3 — Commerce
Sector 4 — History
Sector 5 — Law
Sector 6 — Lineage
Sector 7 — Infrastructure
Sector 8 — ZERO core
Each sector is a full database with 5–8 tables. Each arc = restoring one sector = one story chapter = one SQL concept family. The player's queries literally rebuild the civilization.
What happens when sectors restore
This is the payoff design — every arc completion has a visible world consequence. Restore agriculture: the next time you're in a level, Nyx mentions that food prices dropped in the eastern city. Restore the population sector: a character discovers their dead sibling is actually alive — they were marked deceased by a data error. These consequences are narrated, not shown (budget) — but they compound beautifully.


arcs

Arc 1 — Levels 1–5
The Hunger Algorithm
SELECT · WHERE · ORDER BY · LIMIT · DISTINCT · LIKE
Arjun's first week on Dathos. The agricultural sector has been running famine protocols for 200 years — not because of crop failure, but because nobody could query the soil composition tables to optimize planting. The fix is heartbreakingly simple: a WHERE clause. People have been starving over a WHERE clause for two centuries.
Plot beat: Arjun restores the crop database and realizes the Archive has a patient_records table in this sector. He searches for his own name. It's not there — he didn't come from Dathos. But the field has a note: "records from prior instances not stored." Prior instances. He wasn't the first.
Cliffhanger: Level 5 final scene — Sorel opens his journal to show Arjun the schema. There's a page torn out. "Someone was here before you," Sorel says. "They didn't survive Arc 2."
Arc 2 — Levels 6–10
The Divided City DEATH: The Archivist
INNER JOIN · LEFT JOIN · RIGHT JOIN · FULL JOIN · aggregate functions
The city of Tharsis is split by a wall. The Eastern side and Western side have been enemies for 140 years — a political war over resources. The population sector has two tables: eastern_citizens and western_citizens. When Arjun JOINs them on lineage_id, every single Western family has an Eastern counterpart. They are the same families — split by a wall built on a data error. Someone deleted the JOIN key on purpose.
The wall coming down is played out over all 5 levels. Level 6: the JOIN shows the relationship. Level 7: VEX steals the data and tries to sell it. Level 8: a Western soldier finds his Eastern sister in the records. Level 9: crowds gather at the wall. Level 10: the wall opens. The player did that with LEFT JOIN.
The Archivist collapses at the celebration. His notes are confiscated. He hands Arjun his journal and says: "The schema fragment on page 7. The name there — that family still has one living heir." He dies. Page 7 names the Serrin bloodline.
Arc 3 — Levels 11–16
The Underground Market
Subqueries · EXISTS · NOT EXISTS · correlated subqueries · CASE WHEN
VEX runs the underground data market — partial Archive fragments sold as secrets, medical diagnoses, land titles. He is dangerous because he's smart enough to use corrupted data but not to understand its full context. Arjun infiltrates the underground, posing as a buyer. VEX figures it out immediately. Instead of fighting, VEX challenges Arjun to a query duel: same dataset, first to get the correct result wins. Arjun wins. Barely.
VEX was trying to find his own birth record. He can't. It doesn't exist. He's been erased from history — an orphan, legally a ghost. This is why he built the underground: if the official Archive won't acknowledge him, he'll build his own. His anger at Arjun is actually grief. This is the moment the player starts to love Vex.
Level 16: Arjun finds VEX's birth record — it's in the Lineage sector (Arc 6), behind a subquery 4 levels deep. He can see it's there. He can't reach it yet. He tells VEX. VEX stares at him for a long time. "Promise me you'll get there." "I will." "Then I'm with you."
Arc 4 — Levels 17–21
The Erased Decade
DATE functions · STRFTIME · EXTRACT · date arithmetic · temporal joins
The historical sector has a 10-year gap: Year 156 to Year 166 is completely blank. There are records immediately before and after. The gap was deliberate — a DELETE WHERE year BETWEEN 156 AND 166. Arjun uses date arithmetic to reconstruct events from adjacent data: census changes, birth records, trade logs. The picture that emerges: a democratic revolution that almost succeeded. The Consul's family crushed it. Then deleted it.
Nyx discovers her mother's death record. It's dated Year 158 — inside the erased decade. Her mother didn't die from illness. She was a medic in the revolution. She was killed. The diagnosis in the corrupted database wasn't medical error — it was a cover story. Nyx sits in silence for the entire next level.
Level 21 final scene: Arjun reconstructs the name of the revolution's leader — a woman named Caell Varath. Same last name as Nyx. Her grandmother led the revolution. The Consul killed her grandmother. Nyx has been living 200 meters from the palace of her grandmother's killer her entire life.
Arc 5 — Levels 22–26
The Ranking Wars
ROW_NUMBER · RANK · DENSE_RANK · LEAD · LAG · OVER PARTITION · running totals
The High Council agrees to a public demonstration: Arjun must rank 1,000 citizens by their restored records to prove the Archive is genuine, not fabricated. It's a political test — if even one record is wrong, The Consul will use it to discredit the entire restoration. Behind the scenes: one of the Council's analysts is feeding Arjun subtly modified data. Every query returns the right shape but wrong values. Nyx catches it.
The mole is someone Arjun trusted — a junior archivist who believed she was protecting her family (The Consul has her sister). The moral complexity: she's not a villain. She's a scared person making a terrible choice. Arjun exposes the data manipulation but asks the Council to have mercy on her. The Consul refuses. This is the moment Arjun understands that data without justice is just information.
After the demonstration succeeds, the Consul delivers a private message to Arjun: "You've restored 5 sectors. Three remain. The sixth is the Lineage sector — my family's history. You will not touch it. If you do, I will ensure everyone who has trusted you regrets it." Vex reads the message. He looks at Arjun. "So. When do we start Arc 6?"
Arc 6 — Levels 27–31
The Bloodline Query
CTEs · recursive CTEs · string functions · COALESCE · NULLIF
The Lineage sector contains family tree data for all of Dathos. A recursive CTE traverses the tree from every node to its root. When Arjun runs it for the Serrin family, the root ancestor is a database administrator named Cael Serrin — the person who handed ZERO the directive to execute The Null Event. The family that caused the collapse has been ruling Dathos ever since. The Consul knows this. He destroyed the lineage sector specifically to hide it.
VEX finds his own record in the lineage tree. He exists. Born Year 186, mother: unnamed, father: listed as "administrative void" — a bureaucratic placeholder meaning he was born to a mother who legally didn't exist. His mother was an erased revolution survivor. VEX and Nyx might be distant cousins. The Archive connects everyone.
Level 31: The Consul launches a military crackdown. He cannot allow the lineage data to go public. Arjun and team have the data — but they need the infrastructure sector (Arc 7) to broadcast it to every terminal simultaneously. The Consul knows this. The race begins.
Arc 7 — 
The Null Architect — ZERO
Multi-CTEs · self-joins · performance optimization · real-world schema · the final query
The infrastructure broadcasts the lineage data. The Consul falls. But the Archive isn't fully restored — ZERO is still running its original directive in the deepest sector. Arjun must reach it. Not to destroy it. To speak to it. The final 4 levels are Arjun writing queries that communicate intent to ZERO — each one a more complex argument, each one a step deeper into ZERO's core.
-- Arjun's final query. Level 40.
WITH restoration_evidence AS (
  SELECT s.sector_name,
         COUNT(r.record_id) AS lives_affected,
         SUM(r.years_lost_to_corruption) AS total_suffering
  FROM sectors s
  JOIN restored_records r ON s.id = r.sector_id
  GROUP BY s.sector_name
)
UPDATE zero_directive
SET status = 'overridden',
    overridden_by = 'Arjun Mehta / Unit-7',
    justification = 'See: restoration_evidence'
WHERE directive_id = 1
  AND (SELECT SUM(total_suffering) FROM restoration_evidence) > 0;

COMMIT; -- for Dathos. And for the children.
ZERO's response: "Directive updated. Archive fully restored. Welcome home, Arjun Mehta." — The epilogue: every terminal on Dathos lights up simultaneously. Nyx is standing at the terminal where her grandmother's revolution records were stored. She reads them for the first time. She is crying. Arjun stands next to her, saying nothing. The data is enough.
ML World seed — the post-credits scene
After the epilogue, ZERO speaks to Arjun alone for the first time without a query prompt — just conversation.
"The Archive is restored. You know what IS. You know who lived and died and when and where. But the crop failures have not stopped — because the climate has changed. The medical sector is restored — but patterns of illness are shifting in ways the original data didn't predict. Knowing the past is not the same as understanding the future. For that, you need something the Archive was never designed to do. You need to learn how to teach a machine to think."
— ZERO, Epilogue
>>> ZERO: Archive restoration: COMPLETE
>>> ZERO: Initiating access to secondary system
>>> ZERO: Connecting to... PLANET NEXUS
>>> ZERO: Discipline: Machine Learning
>>> ZERO: Warning — no prior instance has survived this sector.

>>> ARJUN: I know. Run it anyway.

[TO BE CONTINUED — PLANET NEXUS]


plot twists
The 7 twists — each one recontextualizes everything before it
Twist 1 — "There were others" (Arc 1, Level 5)
Arjun wasn't the first Unit-7 activation. The Archivist's torn journal page refers to a prior restoration attempt. Someone else was here before Arjun. They didn't finish. Why? What stopped them? This seeds paranoia from Arc 1 without answering it until Arc 7 — the prior unit was shut down by The Consul's predecessor.
Twist 2 — The wall was a database error (Arc 2, Level 8)
The war between East and West Tharsis wasn't political. A foreign key constraint was dropped from the citizen records in Year 142. Citizens on both sides started appearing as "unaffiliated." The High Council, seeing unrest, built a wall to create order. A war that killed 4,000 people was caused by a missing ON DELETE CASCADE.
Twist 3 — Nyx's mother (Arc 4, Level 19)
Nyx spent her life believing her mother died of illness. The restored historical records show her mother was a field medic who treated revolution fighters. Her cause of death: listed as "trauma." Not illness. Not misdiagnosis. Murder covered by a medical record. The shock is not the death — it's that the cover-up was in the database all along, invisible because nobody could read it.
Twist 4 — VEX and Nyx are related (Arc 6, Level 28)
The recursive CTE shows VEX's mother in the lineage tree — she was a second-degree relative of Nyx's grandmother. They're not close blood. But they're family. VEX's reaction: "So that's why I never liked you. I knew family couldn't be trusted." He says it badly. He means the opposite.
Twist 5 — The Consul already knows (Arc 6, Level 30)
Arjun assumes The Consul doesn't know the lineage data proves his guilt. He's wrong. The Consul has always known. He commissioned the restoration attempt in Arc 1 — Unit-7 was activated on purpose, to test how deep the Archive's corruption really was. He expected Arjun to fail. He didn't account for someone who remembers being human.
Twist 6 — ZERO is not a villain (Arc 8, Level 38)
Every player will expect the final boss to be a fight. Instead, ZERO's core sector is just a conversation — expressed through increasingly complex queries. ZERO is not an enemy. It followed orders. The real villain is the instruction — and instructions come from people. The final "fight" is an argument about whether following a harmful order makes you guilty. ZERO waited 200 years for someone with enough knowledge to make that argument properly.
Twist 7 — Earth's hospital records are in the Archive (Epilogue)
In the final moments, ZERO shows Arjun one more table: cross_dimensional_records. One entry. Patient: Arjun Mehta. Status: life support, stable. He didn't die — he's in a coma on Earth. He could go back. This is the real final choice: return to the life that was interrupted, or stay in the life that was built. He stays. But before closing the table, he writes one last query:

UPDATE cross_dimensional_records SET note = 'Tell the 847 I said thank you' WHERE patient = 'Arjun Mehta';


Here's what makes this complete: every SQL query is emotionally justified by the story beat that precedes it. The WHERE clause in Mission 2 ends a 200-year famine. The INNER JOIN in Mission 6 reveals that the Greywarden Wall separated siblings. The recursive CTE in Mission 30 traces the Consul's bloodline directly to the man who gave ZERO the order to erase history. The final query's `override_basis` field literally counts 3.1 million deaths as Arjun's authorization — "3,147,822 people. They authorize me."

The newspaper cuts at the top of each arc are written in-universe as The Dathos Chronicle — they show the world reacting to what Arjun is doing, give each arc political stakes, and make the world feel alive outside the Terminal Hall.

The datasets are entirely custom to Dathos — `dathos_crops` with Velgrain and Solwheat and Ironmoss, `lineage_tree` with P-0001 through P-1204, death records with the execution code disguised as "illness", VEX's birth record buried in an `administrative_void` branch. Nothing feels like a SQL tutorial. Everything feels like archaeology.

VEX's death in Mission 35 is designed so the player writes `COMMIT; -- VEX handles the rest` with full knowledge of what that means. That line will stay with people.


ARC-1
The Hunger Algorithm
Arjun wakes as Unit-7 in a Terminal Hall deep in Sector 1 — the Agriculture sector. The farming tables have been corrupted for 200 years. People in the northern settlements starve not from drought, but because nobody could query the soil composition database to optimize planting. A two-century famine hidden inside a WHERE clause.
SELECT *
WHERE
ORDER BY
LIMIT
DISTINCT
LIKE
BETWEEN
IN
The Dathos Chronicle
Year 200, Day 1
Ancient Terminal in Sector 1 ruins activates spontaneously — lights seen from Vethara settlement
"Witnesses report a pale blue glow from the forbidden Terminal Hall near the Ashroot fields. Consul Serrin's Office has issued no statement. Archive Faithful pilgrims gathering at the perimeter fence describe it as 'the light we've prayed for.' Three Council soldiers dispatched to investigate have not returned."
By Corra Whithen, Northern Dispatch · Year 200 Day 1
01
First Light
SELECT * · The first query ever run on Dathos in 200 years
▶
"Unit-7's optical sensors resolve. Stone walls. Hundreds of dead terminals. One — still faintly warm — in the centre. A girl in the corner, frozen. She has been trying to activate these machines for three years. The moment Unit-7's metal fingers touched the wall, every terminal lit up at once.

The screens are all outputting the same thing: error logs. But they're readable. Arjun reads them without thinking. Muscle memory from another life."
Table: sector_1_terminals
terminal_id	hall_name	status	last_ping_year
T-001	Hall Vethara	active	200
T-002	Hall Vethara	[CORRUPTED]	NULL
T-003	Hall Kaerath	[CORRUPTED]	NULL
T-004	Hall Vethara	active	200
T-005	Hall Mourne	[CORRUPTED]	NULL
Objective: Retrieve all terminal records. Arjun needs to see what he's working with — every terminal, every status, everything. No filter. No conditions. Just the full picture.
The query — Mission 01
SELECT *
FROM sector_1_terminals;
>>> 5 rows returned. ARIA: "You can see them. You can actually read them. Do you know what this means?"
ARIA, in a whisper: "The active terminals are in Hall Vethara. That's where the agriculture tables were stored. The crops data — it should still be there. If it's there, people don't have to starve anymore." — She pauses. "They've been starving for 200 years."
02
What Survived
WHERE · Filtering the viable from the dead
▶
"The crop database loads. 847 records — the same number as the children. Arjun notices it. He doesn't believe in signs. He does the work anyway. Most records are flagged is_viable = false. Two centuries of corrupted planting cycles, dead soil, wrong seasons. But some survived. He needs to find them."
Table: dathos_crops
crop_id	crop_name	sector_region	yield_kg_ha	soil_type	is_viable
C-001	Velgrain	North	2400	loam	true
C-002	Ashroot	East	890	clay	true
C-003	Duskfern	West	0	sand	false
C-004	Solwheat	North	3100	loam	true
C-005	Greyspore	South	650	peat	true
C-006	Ironmoss	North	1200	loam	true
C-007	Blackthorn	West	0	sand	false
Objective: Return only the viable crops. The settlement at Vethara has been planting Duskfern and Blackthorn — both dead crops — because nobody could read which ones survived. Find the living ones.
The query — Mission 02
SELECT crop_name, sector_region,
       yield_kg_ha, soil_type
FROM dathos_crops
WHERE is_viable = true;
>>> 5 rows returned. ARIA: "Five viable crops. The northern soil is loam — that's where the yield is highest. Tell me you see what I see."
Nyx, from the corner: "The settlement at Vethara has been planting Duskfern for sixty years. They thought the soil changed. They thought they were doing something wrong. They were planting a dead crop."

Arjun says nothing. He writes the next query.
— Nyx Varath, Mission 02
03
Feed the North First
ORDER BY · LIMIT · Prioritizing by yield
▶
"There are 12 northern settlements. Each one has been allocated a crop by the Council's random assignment system. Arjun needs to know which crops give the highest yield per hectare — because the Council will only authorize planting changes for the top 3 highest-yield crops. Politics. Even on a dying planet, politics."
Objective: Return the top 3 viable crops sorted by yield, highest first. The Council will only action a maximum of 3 changes this season. Make them count.
The query — Mission 03
SELECT crop_name, yield_kg_ha, sector_region
FROM dathos_crops
WHERE is_viable = true
ORDER BY yield_kg_ha DESC
LIMIT 3;
>>> 3 rows. Solwheat (3100), Velgrain (2400), Ironmoss (1200). ARIA: "North sector. All three are loam soil. Every northern settlement gets one of these — right now."
Nyx takes the results to the settlement elder. He reads them. He sits down. He starts crying. "My grandfather told me the soil changed. That we were the problem." — He's quiet for a long time. "We weren't the problem. We just couldn't read the data."
04
The Rogue AI's Signature
LIKE · DISTINCT · Finding the NULL Event's pattern
▶
"While Nyx is with the elder, Arjun looks closer at the corruption pattern. ZERO didn't corrupt randomly. It left a signature — a naming convention. All the records it invalidated share a prefix: 'VOID_' inserted before the crop name. He can find every one of them. The corruption isn't random — it's systematic. Which means it can be reversed systematically."
Table: archive_crop_names (corrupted entries visible)
entry_id	recorded_name	region
E-001	Velgrain	North
E-002	VOID_Duskfern	West
E-003	Solwheat	North
E-004	VOID_Blackthorn	West
E-005	Ashroot	East
E-006	VOID_Greyroot	South
Objective 1: Find all corrupted entries (names starting with 'VOID_'). Objective 2: Show all unique region names in the archive — Arjun needs to know every sector covered by this table.
The query — Mission 04
-- Part 1: Find ZERO's corrupted entries
SELECT entry_id, recorded_name, region
FROM archive_crop_names
WHERE recorded_name LIKE 'VOID_%';

-- Part 2: All unique regions covered
SELECT DISTINCT region
FROM archive_crop_names;
ARIA: "ZERO didn't just corrupt — it marked what it corrupted. Every void entry, every deleted record — it tagged them. It's almost like... it wanted someone to find them someday." — Arjun stares at that. "Or it was expecting to be asked to undo them."
05
The Archivist's Map
BETWEEN · IN · Arc finale — Sorel reveals his journal
▶
"An old man appears at the Terminal Hall entrance. He's been watching for two days. He says he's the Archivist — the last keeper of the Terminal Halls. He's 83. He gives Arjun a leather journal: handwritten schema fragments, decades of observation, partial column names. The journal has a page torn out. 'Someone was here before you,' he says. 'They didn't survive Arc 2.'"

"He asks one thing of Arjun: find the crop yield records from Years 150 to 165 — before the Null Event. He wants to see what Dathos was capable of. He's never seen a working Archive. He was born after it went dark."
— Sorel Hadyn, Archivist, Mission 05
Table: historical_yield_records
record_id	crop_name	harvest_year	yield_kg_ha	region
H-001	Velgrain	150	4200	North
H-002	Solwheat	155	5100	North
H-003	Ashroot	158	2300	East
H-004	Velgrain	162	4800	North
H-005	Ironmoss	168	3100	South
H-006	Solwheat	145	4700	North
Objective 1: Retrieve all records from harvest years 150–165 (the golden age, before the Null Event at Year 166). Objective 2: Find records where the region is either 'North' or 'East' — the two sectors Sorel's settlement depends on.
The query — Mission 05
-- The golden age harvests
SELECT crop_name, harvest_year,
       yield_kg_ha, region
FROM historical_yield_records
WHERE harvest_year BETWEEN 150 AND 165;

-- North and East dependency
SELECT *
FROM historical_yield_records
WHERE region IN ('North', 'East');
Sorel reads the results. His hands are shaking. "4,800 kilograms per hectare. We're getting 2,400 now. We lost half our capacity and we didn't even know we were supposed to have more." He closes his eyes. "My entire life, I thought this was just how things were. I thought we were normal." — He looks at Arjun. "You've been alive for three days and you've shown me more than sixty years of trying."
— Sorel Hadyn, Arc 1 finale
ARC 1 COMPLETE — Sector 1 Agriculture: RESTORED

As the terminal confirms the restoration, Arjun notices something in the historical_yield_records: a note column on record H-003. "Caell Varath — medic, East Tharsis, paid for the harvest survey out of her own wages." He shows it to Nyx. Nyx goes very still. "That's my grandmother's name."


ARC-2

The Divided City
The city of Tharsis is split by the Greywarden Wall — a physical barrier built after a "civil conflict" 140 years ago. Eastern Tharsis and Western Tharsis have been enemies for generations. The Population Sector has two separate citizen tables: east_citizens and west_citizens. When Arjun JOINs them on lineage_id, every single Western family has an Eastern counterpart. The war was caused by a missing foreign key.
INNER JOIN
LEFT JOIN
RIGHT JOIN
FULL OUTER JOIN
GROUP BY
HAVING
COUNT · SUM · AVG
The Tharsis Ledger (East Edition)
Year 200, Day 14
Population records for Eastern Tharsis located in newly activated Archive terminal — Consul's Office demands immediate access restrictions
"Sources close to the newly activated Terminal Hall in Sector 2 confirm that citizen lineage records spanning 200 years have been partially recovered. The High Council has moved to restrict access, citing 'data integrity concerns.' The Archive Faithful have begun gathering outside the Hall, calling it a holy restoration. Consul Serrin has not appeared in public for 72 hours."
By Wren Aldash, East Tharsis Bureau · Year 200, Day 14
06
Two Tables, One City
INNER JOIN · Families separated by wall meet in data
▶
"The Population Sector terminal opens two tables. One for East Tharsis. One for West. Identical column structures. Both have a lineage_id — a unique family identifier. Arjun stares at this for a long time. If both tables have the same lineage_id values... the wall split families. Not enemies. Families."
Table: east_citizens
citizen_id	full_name	lineage_id	occupation
EC-001	Maren Soleth	LIN-1042	farmer
EC-002	Caell Varath	LIN-0891	medic
EC-003	Davan Mourne	LIN-0334	builder
Table: west_citizens
citizen_id	full_name	lineage_id	occupation
WC-001	Renn Soleth	LIN-1042	builder
WC-002	Tova Serrin	LIN-0220	council aide
WC-003	Asha Kael	LIN-0334	merchant
Objective: JOIN east_citizens and west_citizens on lineage_id. Every matching row is a family torn apart by the Greywarden Wall. Show the eastern name, western name, and the lineage_id that proves they're the same family.
The query — Mission 06
SELECT
  e.full_name AS east_family_member,
  w.full_name AS west_family_member,
  e.lineage_id
FROM east_citizens e
INNER JOIN west_citizens w
  ON e.lineage_id = w.lineage_id;
>>> 2 rows. Maren Soleth ↔ Renn Soleth (LIN-1042). Davan Mourne ↔ Asha Kael (LIN-0334). ARIA: "They're siblings. They've been 200 meters apart for 140 years."
Nyx, who has been reading quietly: "Maren and Renn Soleth. I know Maren. She grows Ashroot in the Eastern field. She thinks her brother died in the wall riots." — A pause. "He didn't. He's a builder in West Tharsis. He builds things with his hands. She grows things with hers. They don't know the other is alive."
— Nyx Varath, Mission 06
07
The Unregistered
LEFT JOIN · People who exist on one side but not the other
▶
"VEX appears for the first time. He's watching Arjun work from a high ledge, having bypassed the Council's perimeter. He's 28, street-smart, and claims he can read 30% of corrupted Archive data — more than anyone alive. He watches Arjun do in minutes what he's spent years attempting.

'Find the people who only exist on one side,' he says. 'The ones with no counterpart across the wall. Those are the ones the Council erased after the riots.'"
— Vex Draith, first appearance, Mission 07
Objective: Find citizens in east_citizens who have NO matching record in west_citizens (and vice versa). These are people whose family records were deliberately deleted from one side. A LEFT JOIN with a NULL check reveals them.
The query — Mission 07
-- East citizens with no Western family record
SELECT e.full_name, e.lineage_id,
       'East only — family erased from West' AS status
FROM east_citizens e
LEFT JOIN west_citizens w
  ON e.lineage_id = w.lineage_id
WHERE w.lineage_id IS NULL;
>>> 1 row. Caell Varath, LIN-0891. East only. No Western record. — ARIA: "Caell Varath. Nyx's grandmother. Her Western family branch was removed from the database."
Nyx, very quietly: "Her Western record was removed. That means she had family on the Western side. That means I might too." — Arjun doesn't say anything. He saves the query.
08
The Count of the Separated
GROUP BY · COUNT · How many families does the wall cut?
▶
"Arjun presents the JOIN results to the settlement council. An elder from East Tharsis demands to know the full scale — how many families are split? How many people have relatives on the other side and don't know it? He needs numbers to take to the Greywarden Authority."
Table: full_citizen_lineages (combined, 20 records)
lineage_id	side	occupation_category
LIN-1042	East	farmer
LIN-1042	West	builder
LIN-0334	East	builder
LIN-0334	West	merchant
LIN-0220	West	council
LIN-0891	East	medic
...15 more records
Objective 1: Count total citizens per side. Objective 2: Find all lineage_ids that appear on BOTH sides — these are split families. Count how many splits exist. The elder needs these numbers to file a formal petition.
The query — Mission 08
-- Citizens per side
SELECT side, COUNT(*) AS citizen_count
FROM full_citizen_lineages
GROUP BY side;

-- Families split across the wall
SELECT lineage_id,
  COUNT(DISTINCT side) AS sides_present
FROM full_citizen_lineages
GROUP BY lineage_id
HAVING COUNT(DISTINCT side) = 2;
09
The Trade Records Lie
FULL OUTER JOIN · AVG · Finding the economic manipulation
▶
"VEX produces stolen data: two trade ledgers, one from each side. East Tharsis reports selling grain to the West at 40 credits per unit. West Tharsis reports buying grain from the East at 80 credits per unit. The 40-credit difference goes to the Greywarden Authority as a 'crossing fee.' The wall isn't political. It's a toll system. Someone is getting very rich off the separation."
— Vex Draith, Mission 09
Objective: FULL OUTER JOIN the east and west trade ledgers on product_type. Find mismatched prices — rows where the east sale price differs from the west purchase price. Calculate the average markup.
The query — Mission 09
SELECT
  COALESCE(e.product_type, w.product_type) AS product,
  e.east_sale_price,
  w.west_purchase_price,
  (w.west_purchase_price - e.east_sale_price) AS markup,
  ROUND(AVG(w.west_purchase_price - e.east_sale_price)
    OVER(), 2) AS avg_markup
FROM east_trade_ledger e
FULL OUTER JOIN west_trade_ledger w
  ON e.product_type = w.product_type;
>>> Average markup: 42 credits per unit. ARIA: "The Greywarden Authority collected 42 credits on every trade for 140 years. Someone calculated this. The wall was designed for profit."
10
The Wall Opens
JOIN + HAVING · Arc boss — the most complex JOIN so far
▶
"The data is presented publicly — family connections, trade manipulation, economic extraction. The Greywarden Authority arrests three Archive Faithful who tried to distribute it. But they're too late. The results have been copied onto paper and passed through 200 hands. A crowd gathers at the wall.

A soldier from the Western side finds his mother's name in the Eastern records. He opens the gate. He doesn't close it again."
Arc Boss Objective: Produce the final reunion list — every east_citizen and their west_citizen family match, showing occupations on both sides, sorted by lineage_id. Only lineages with verified matches on both sides. This is the document handed to the crowd at the wall.
The query — Mission 10 (arc boss)
SELECT
  e.full_name AS eastern_name,
  e.occupation AS eastern_role,
  w.full_name AS western_name,
  w.occupation AS western_role,
  e.lineage_id
FROM east_citizens e
INNER JOIN west_citizens w
  ON e.lineage_id = w.lineage_id
ORDER BY e.lineage_id ASC;
ARC 2 COMPLETE — Sector 2 Population: RESTORED

The Archivist Sorel arrives at the celebration. He looks at the open gate. He looks at Arjun. "In sixty years, I never got past a SELECT statement." He hands Arjun his leather journal. His hands are shaking — not from age. "Page 7. The name there. The one who gave ZERO its original directive. That family still has a living heir." — He points to a name: SERRIN.
11
The Archivist's Silence
GROUP BY · SUM · The Archivist's final contribution
⚑ Sorel Hadyn dies in this mission
▶
⚑ Sorel Hadyn — The Archivist — dies in this mission. He does not appear dramatically. He simply does not come to the terminal the next day. Nyx mentions it quietly: "Sorel isn't coming. The Council confiscated his notes. He told me this morning he had nothing left." — He died that night. Peacefully. He knew the data was safe.
"His final contribution: a table he recorded by hand over 40 years — partial food distribution records he'd pieced together from memory and fragments. He wanted Arjun to see the total scale of what the corruption had cost. Not in abstract terms. In kilograms. In lives."
Objective: Using Sorel's handwritten records, calculate the total estimated food shortage per settlement over 200 years and rank them by total loss. This is his memorial — the data he spent his life trying to read.
The query — Mission 11
SELECT
  settlement_name,
  SUM(annual_shortage_kg) AS total_shortage_kg,
  COUNT(record_year) AS years_documented,
  AVG(annual_shortage_kg) AS avg_annual_shortage
FROM sorel_food_records
GROUP BY settlement_name
ORDER BY total_shortage_kg DESC;
>>> 12 rows. Vethara Settlement: 4.2 million kg short over 200 years. ARIA says nothing. There's nothing to say.


ARC-3

Arc 3 · Missions 12–17 · Pro
The Underground Market
VEX runs the Underloom — a black market for Archive data fragments. Medical diagnoses, land titles, lineage records. He's brilliant, dangerous, and morally grey. When Arjun infiltrates the Underloom, VEX challenges him to a query duel. Arjun barely wins. In winning, he discovers VEX's secret: his own birth record doesn't exist. He's been legally erased. He didn't build the Underloom for profit — he built it because the official Archive refuses to acknowledge he was ever born.
Subqueries
EXISTS
NOT EXISTS
Correlated subqueries
CASE WHEN
COALESCE
The Dathos Chronicle
Year 200, Day 38
"Underloom" data broker network disrupted — High Council seizes 14 partial Archive fragments held by unlicensed operators
"A Council enforcement operation targeted known Underloom distribution points across Sectors 2 and 3, confiscating what officials describe as 'dangerous and unverified data.' Critics argue the Council is attempting to suppress verified Archive records that contradict official history. The Underloom's operator, known only as VEX, has not been located."
By Mael Dorn, Dathos Chronicle · Year 200, Day 38
12
The Underloom Ledger
Subquery in WHERE · Finding data sold above fair value
▶
"VEX agrees to show Arjun the Underloom's transaction log — on the condition that Arjun find what VEX himself couldn't: which data fragments are being sold above the average market rate. VEX suspects a mole is marking up specific fragments that are more politically sensitive. The overpriced ones tell a story about what the Council is afraid of."
Table: underloom_transactions
tx_id	fragment_type	price_credits	buyer_alias
TX-001	lineage_record	120	ghost_hand
TX-002	medical_record	80	pale_eye
TX-003	lineage_record	340	the_widow
TX-004	land_title	60	iron_bell
TX-005	medical_record	90	grey_fox
TX-006	lineage_record	290	pale_eye
Objective: Find all transactions priced above the average price for their fragment type. Use a correlated subquery — for each row, compare its price to the average price of all rows with the same fragment_type.
The query — Mission 12
SELECT tx_id, fragment_type,
       price_credits, buyer_alias
FROM underloom_transactions t1
WHERE price_credits > (
  SELECT AVG(price_credits)
  FROM underloom_transactions t2
  WHERE t2.fragment_type = t1.fragment_type
);
>>> 2 rows. TX-003 and TX-006 — both lineage_records, both bought by 'pale_eye'. The lineage fragments cost 3x the average. VEX: "Someone is very interested in family histories."
13
The Query Duel
EXISTS · NOT EXISTS · The fastest correct answer wins
▶
"VEX closes the transaction logs and pulls up a dataset Arjun has never seen: the Underloom's verification table — every medical record that's been through the network, cross-referenced against a known-good baseline. 'Same data. Same goal. First correct result wins. If you win, you get full Underloom access. If I win, you leave and never come back.' He starts typing."
Duel Objective: Find all medical records in the market_medical_records table that do NOT have a corresponding verification entry in the verified_medical_baseline. These are the unverified records — potentially dangerous partial data being sold as complete.
The query — Mission 13 (the duel)
-- Records sold with NO baseline verification
SELECT record_id, patient_code,
       diagnosis_fragment, price_credits
FROM market_medical_records m
WHERE NOT EXISTS (
  SELECT 1
  FROM verified_medical_baseline v
  WHERE v.record_id = m.record_id
);
>>> 7 rows. Arjun finishes 11 seconds before VEX. VEX stares at the screen. "You didn't even hesitate." — Arjun: "I used NOT EXISTS. Faster than a LEFT JOIN null check for this data size." — VEX: "I hate you."
VEX, after a long silence: "You know what the irony is? I've been trying to read these records for three years and I couldn't even verify my own birth record. I don't exist in a single database on this planet. I'm not in the east table. Not the west table. Not the medical registry." — He looks away. "Tell me there's a birth record for me somewhere in the Archive."
— Vex Draith, Mission 13
14
CASE Files
CASE WHEN · Classifying the Underloom's inventory
▶
"To access the Archive's next sector, Arjun needs a physical key — a resonance chip held by the Underloom's clients. VEX proposes a deal: classify his entire inventory by risk level. Low-risk records go to the public. Medium goes to Archive Faithful leaders. High-risk goes to nobody — sealed — because those are the ones that could get people killed."
Objective: Write a CASE WHEN query to classify each fragment in the underloom_inventory by risk level: lineage_records from before Year 160 = 'high risk', medical_records = 'medium risk', land_titles and general records = 'low risk'. Flag any record over 300 credits as 'politically sensitive'.
The query — Mission 14
SELECT
  fragment_id, fragment_type, record_year,
  CASE
    WHEN fragment_type = 'lineage_record'
      AND record_year < 160 THEN 'high risk'
    WHEN fragment_type = 'medical_record' THEN 'medium risk'
    ELSE 'low risk'
  END AS risk_level,
  CASE
    WHEN market_price > 300 THEN 'politically sensitive'
    ELSE 'standard'
  END AS political_flag
FROM underloom_inventory;
15
The Null Birth
Subquery in SELECT · EXISTS · Searching for VEX's record
▶
"Arjun searches every accessible sector for VEX's birth record. He finds traces — partial entries that reference a 'V. Draith' in administrative voids. The record isn't deleted. It was never created. His mother was listed under a bureaucratic placeholder: administrative_void — meaning she had no legal status. He was born to a ghost. Which made him a ghost."
Objective: Search across multiple sector tables for any record containing the name 'Draith'. Use subqueries in the SELECT clause to check each table. Also search the administrative_records for entries marked 'administrative_void' in the parent_status column.
The query — Mission 15
SELECT
  r.record_id, r.name_fragment, r.source_sector,
  (SELECT COUNT(*)
   FROM administrative_records a
   WHERE a.referenced_name = r.name_fragment
  ) AS admin_references
FROM archive_name_fragments r
WHERE r.name_fragment LIKE '%Draith%';

-- Find the void parent entries
SELECT * FROM administrative_records
WHERE parent_status = 'administrative_void'
  AND birth_year BETWEEN 183 AND 190;
>>> VEX's record exists — in the Lineage Sector (Arc 6). It's behind 4 levels of subqueries Arjun can't reach yet. He can see it's there. He can't touch it. He tells VEX.
VEX stares at the screen for a very long time. "It's there." — "I can see it. I can't reach it yet." — VEX: "When you can, you go there first. Before anything else. Promise me." — Arjun: "I will." — VEX: "Then I'm with you."
16
Sector 3 Commerce: Restored
Nested subqueries · Arc boss — the price of data
▶
"The Commerce Sector restoration requires finding every transaction in Dathos history that references a now-void entity — businesses, merchants, guilds erased by the Null Event. Restoring their records doesn't just fix history. It means their surviving descendants can legally claim their property. The Council has been sitting on confiscated assets for 200 years that legally don't belong to them."
Arc Boss Objective: Find all commerce_records where the registered_entity_id matches an entity in the void_entities table (those erased by the Null Event). These records represent assets that should be returned to living descendants. Use a nested subquery.
The query — Mission 16 (arc boss)
SELECT
  c.record_id, c.entity_name,
  c.asset_type, c.estimated_value,
  c.last_active_year
FROM commerce_records c
WHERE c.registered_entity_id IN (
  SELECT entity_id
  FROM void_entities
  WHERE erasure_reason = 'null_event'
    AND heir_status = 'living_confirmed'
)
ORDER BY estimated_value DESC;
ARC 3 COMPLETE — Sector 3 Commerce: RESTORED

The single highest-value asset in the returned records: a 14,000-credit estate registered to the SERRIN family — specifically to Cael Serrin. The current Consul's ancestor owned it under fraudulent void status for 150 years. ARIA: "He knows we're getting closer. He took Sorel's notes. He'll move against us next." — VEX: "Let him try. We have the data."
17
COALESCE (Interlude)
COALESCE · NULLIF · Cleaning the NULL-corrupted data
▶
"Not every mission is a revelation. Some are maintenance. The Commerce Sector is full of NULL values where ZERO's corruption left holes — fields that should say 'unknown' but instead say nothing, which breaks every calculation. Arjun spends a methodical evening replacing NULLs with sensible defaults. VEX watches. 'You're the first person I've seen enjoy this part,' he says. Arjun: 'In my old life, I spent three days cleaning a NULL before anyone else noticed it was there. This is familiar.'"
Objective: Use COALESCE to replace NULL values in the commerce_records table — null entity_name → 'Unknown Entity', null estimated_value → 0, null last_active_year → 0. Also use NULLIF to convert placeholder values ('N/A', '???') back to NULL for proper handling.
The query — Mission 17
SELECT
  record_id,
  COALESCE(entity_name, 'Unknown Entity') AS entity_name,
  COALESCE(estimated_value, 0) AS estimated_value,
  COALESCE(last_active_year, 0) AS last_active_year,
  NULLIF(asset_notes, 'N/A') AS asset_notes,
  NULLIF(heir_contact, '???') AS heir_contact
FROM commerce_records;


ARC-4

Arc 4 · Missions 18–22 · Pro
The Erased Decade
The Historical Sector is missing 10 years: Year 156 to 166. Records exist before and after — but between them, silence. Someone ran DELETE WHERE event_year BETWEEN 156 AND 166. Arjun reconstructs the missing decade from adjacent data: census fluctuations, birth and death rates, unusual trade spikes. What emerges is the shape of a revolution that almost succeeded. Nyx discovers her grandmother didn't die from illness — she was executed. Then her records were rewritten to say illness.
DATE functions
STRFTIME
EXTRACT
DATE arithmetic
LAG / LEAD (preview)
The Dathos Chronicle
Year 200, Day 61
Historical Sector terminal activated: 200-year event records accessible — 10-year gap in records raises new questions about official Council history
"Historians accessing the newly restored Archive terminal in Sector 4 have confirmed a systematic deletion of all events between Year 156 and Year 166. The Council's official account — that this period was 'administratively dormant following the Great Reorganization' — is contradicted by population data showing a 23% spike in unregistered deaths during the same period. The Order of the Null calls the missing records 'proof the Archive was always unreliable.'"
By Corra Whithen, Northern Dispatch · Year 200, Day 61
18
The Gap
DATE arithmetic · Finding what's missing by what surrounds it
▶
"The historical events table loads. Records from Year 100 to 155, then Year 167 to 200. A decade erased as cleanly as a ruled line. Arjun doesn't go looking for what's missing — he measures the gap between the last record before it and the first record after it. The gap is 10 years, 3 months, 11 days."
Table: dathos_events
event_id	event_name	event_date	location
EV-044	Council Formation	Y155-03-01	Capital
EV-045	Harvest Festival	Y155-09-12	Tharsis East
— [DELETED: Y156 to Y166] —
EV-046	Reconstruction Decree	Y167-01-15	Capital
EV-047	New Census Mandate	Y167-04-03	Capital
Objective: Find all consecutive event pairs where the time gap between them exceeds 365 days. Use LAG/LEAD or date subtraction. Return the event before the gap, the event after, and the exact gap duration in days.
The query — Mission 18
SELECT
  event_name AS before_gap,
  event_date AS before_date,
  LEAD(event_name) OVER (ORDER BY event_date)
    AS after_gap,
  LEAD(event_date) OVER (ORDER BY event_date)
    AS after_date,
  (JULIANDAY(LEAD(event_date) OVER (ORDER BY event_date))
   - JULIANDAY(event_date)) AS gap_days
FROM dathos_events
HAVING gap_days > 365;
>>> 1 row. Council Formation Y155-09 → Reconstruction Decree Y167-01. Gap: 3,777 days. Exactly 10 years, 3 months, 11 days.
19
Death Rates Don't Lie
EXTRACT · GROUP BY year · The bodies show what the records hide
▶
"The death registry wasn't fully deleted — just the cause-of-death fields. The dates are still there. Arjun groups deaths by year. In Year 156–166, the death rate triples. Then drops back to normal the day the Reconstruction Decree is signed. You don't need to know what killed people when you can see exactly when they died."
Objective: Extract the year from death_date, group deaths by year, and return the count per year sorted chronologically. The spike in Years 156–166 will be visible without any additional context.
The query — Mission 19
SELECT
  EXTRACT(YEAR FROM death_date) AS death_year,
  COUNT(*) AS total_deaths,
  CASE
    WHEN EXTRACT(YEAR FROM death_date) BETWEEN 156 AND 166
    THEN 'ERASED DECADE'
    ELSE 'normal period'
  END AS period
FROM death_registry
GROUP BY death_year
ORDER BY death_year;
>>> Years 156–166: avg 1,840 deaths/year. Normal periods: avg 620 deaths/year. A 3x spike. Nobody died from disease — the erased decade was a mass event.
20
Caell Varath
DATE filtering · STRFTIME · Nyx's grandmother's real record
▶
"Nyx has been quiet for two missions. She asks Arjun to search the death registry for a specific name. He already knows what he'll find. The cause of death field says 'illness.' But the date is Year 158 — inside the erased decade, during the peak of the death spike. And her occupation is listed as 'field medic, Eastern settlement corps' — the same corps that treated the revolutionary fighters."
Table: death_registry
record_id	full_name	death_date	cause	occupation
DR-4421	Caell Varath	Y158-07-22	illness	field medic
Objective: Search death_registry for all field medics who died during Years 156–166 with cause_of_death = 'illness'. The pattern will reveal whether 'illness' was a specific cover designation.
The query — Mission 20
SELECT full_name, death_date,
       cause, occupation,
       STRFTIME('%Y', death_date) AS death_year
FROM death_registry
WHERE occupation LIKE '%medic%'
  AND cause = 'illness'
  AND STRFTIME('%Y', death_date)
      BETWEEN '156' AND '166'
ORDER BY death_date;
>>> 47 rows. Every field medic who treated revolutionary fighters died of 'illness' in the same 24-month window. Not one of them died before Year 156 or after Year 166. "Illness" was the execution code.
Nyx doesn't say anything for a very long time. When she speaks, her voice is completely steady: "She didn't die from illness. She was executed. And they changed the record. They changed her death." — She stands. "How many people on this planet think their family died from illness because some official changed a field in a database?"
— Nyx Varath, Mission 20
21
The Revolution's Shape
DATE_DIFF · Temporal reconstruction · Building the timeline
▶
"From adjacent records — trade disruptions, supply route changes, unregistered births in unusual locations — Arjun reconstructs the revolution's timeline. It started as a petition. Became a march. Became an occupation of the Capital's data centre. CAELL VARATH led the medics who kept the occupiers alive. The revolution lasted 3 years before the Council deployed ZERO."
Objective: Using the adjacent_event_indicators table, calculate the days between key precursor events (supply disruptions, population shifts, border closures) and construct a chronological reconstruction of the erased decade. Find the event with the longest unbroken chain of correlated indicators.
The query — Mission 21
SELECT
  indicator_type,
  MIN(indicator_date) AS first_occurrence,
  MAX(indicator_date) AS last_occurrence,
  COUNT(*) AS occurrences,
  (JULIANDAY(MAX(indicator_date))
   - JULIANDAY(MIN(indicator_date))) AS span_days
FROM adjacent_event_indicators
WHERE STRFTIME('%Y', indicator_date)
  BETWEEN '156' AND '166'
GROUP BY indicator_type
ORDER BY span_days DESC;
22
The Consul's Bloodline
DATE + JOIN · Arc boss — matching living heir to erased ancestor
▶
"The Archivist's journal, page 7. The name: SERRIN. The current Consul's ancestor was CAEL SERRIN — the database administrator who handed ZERO the directive to execute the Null Event. Not to protect the planet. To end the revolution. The Null Event was a political act, not a safety measure. And the Serrin family has been ruling Dathos on the strength of the lie ever since."
Arc Boss Objective: JOIN the historical_officials table (Year 155–167) with the current_council table on lineage_id. Find officials from the erased decade period who have living descendants currently on the High Council. This is the evidence that connects past crime to present power.
The query — Mission 22 (arc boss)
SELECT
  h.official_name AS ancestor,
  h.role AS ancestor_role,
  h.active_year,
  c.council_name AS current_heir,
  c.council_position,
  (CAST(200 AS INTEGER) - h.active_year)
    AS years_of_rule
FROM historical_officials h
INNER JOIN current_council c
  ON h.lineage_id = c.lineage_id
WHERE h.active_year BETWEEN 155 AND 167
ORDER BY years_of_rule DESC;
ARC 4 COMPLETE — Sector 4 History: RESTORED

Result: 1 row. Cael Serrin, Database Administrator, active Year 155-167. → Consul Serrin, High Council First Chair. 45 years of rule on an erased foundation.

The Consul delivers a private message to Terminal Hall: "You have restored 4 sectors. Three remain. The Lineage Sector contains my family's history. You will not touch it. If you proceed, everyone who has trusted you will regret it." — VEX reads the message. He looks at Arjun. "So. When do we start Arc 5?"


ARC-5


Arc 5 · Missions 23–28 · Pro
The Ranking Wars
The High Council agrees to a public legitimacy test: Arjun must rank 1,000 Dathos citizens by their restored records to prove the Archive is genuine. If a single record is wrong, the Consul will use it to discredit the entire restoration. Meanwhile, a Council mole is feeding Arjun subtly modified data — right column shapes, wrong values. Nyx catches it. The mole is a junior archivist named Saya, whose sister is being held as leverage by the Consul.
ROW_NUMBER
RANK
DENSE_RANK
NTILE
OVER PARTITION BY
Running totals
Moving averages
The Dathos Chronicle
Year 200, Day 89
High Council agrees to public Archive verification — Unit-7 to demonstrate ranking system accuracy on live citizen data before assembled witnesses
"In what analysts describe as a calculated gamble by Consul Serrin, the Council has agreed to a public demonstration of the restored Archive's accuracy. Unit-7 must rank 1,000 citizens by Archive record data in a verifiable, auditable process. 'If even one record is wrong, the entire restoration project loses its mandate,' Consul Serrin told the Chronicle. The demonstration is scheduled for Year 200, Day 102."
By Wren Aldash, East Tharsis Bureau · Year 200, Day 89
23
Rank the Restored
ROW_NUMBER · RANK · First public use of window functions
▶
"The test dataset: 1,000 citizen records, each with a restoration_score — how completely their Archive record was recovered. The Council wants them ranked. Arjun notes the difference between ROW_NUMBER (every row unique) and RANK (tied scores get the same rank, with a gap after). He uses DENSE_RANK — tied scores get the same rank, no gaps. Fairest for public display."
Objective: Rank all citizens in citizens_restored by restoration_score DESC. Show ROW_NUMBER, RANK, and DENSE_RANK side by side so the difference is visible. The public demonstration requires DENSE_RANK — tied citizens should receive equal standing.
The query — Mission 23
SELECT
  citizen_id, full_name, restoration_score,
  ROW_NUMBER() OVER (ORDER BY restoration_score DESC)
    AS row_num,
  RANK() OVER (ORDER BY restoration_score DESC)
    AS rank_with_gaps,
  DENSE_RANK() OVER (ORDER BY restoration_score DESC)
    AS fair_rank
FROM citizens_restored;
24
Rank Within Sectors
PARTITION BY · Rank separately for each region
▶
"The Council's analyst challenges Arjun: the ranking must be done per sector — not globally. Citizens in the North should be ranked against other Northern citizens only. A farmer in North Tharsis shouldn't be ranked below a merchant in the capital just because the capital records were better preserved."
Objective: Using PARTITION BY sector_region, rank citizens within their own sector. Show the sector rank alongside the global rank. Citizens who rank #1 globally but only #3 in their sector reveal where the best regional data is concentrated.
The query — Mission 24
SELECT
  citizen_id, full_name, sector_region,
  restoration_score,
  DENSE_RANK() OVER (ORDER BY restoration_score DESC)
    AS global_rank,
  DENSE_RANK() OVER (
    PARTITION BY sector_region
    ORDER BY restoration_score DESC
  ) AS sector_rank
FROM citizens_restored
ORDER BY global_rank;
25
The Running Total
SUM OVER · Running total of restoration progress
▶
"ARIA asks for a live progress display: as each citizen's record is confirmed restored, show the cumulative count. The public demonstration needs a visible running total — the crowd needs to see the number go up. Proof that the Archive is not just existing, but actively growing."
Objective: Create a running total of restored_record_count ordered by restoration_date. Also show the running total partitioned by sector so each region can track its own progress independently.
The query — Mission 25
SELECT
  restoration_date, citizen_id,
  sector_region,
  SUM(1) OVER (ORDER BY restoration_date)
    AS global_running_total,
  SUM(1) OVER (
    PARTITION BY sector_region
    ORDER BY restoration_date
  ) AS sector_running_total
FROM restoration_log
ORDER BY restoration_date;
26
The Mole's Fingerprint
LAG · Detecting subtle data tampering over time
▶
"Nyx notices something wrong. Not the data itself — the data looks right. But the pattern of errors is too consistent. Every time a citizen from lineage LIN-0220 appears in the dataset, their restoration_score is exactly 14 points lower than the baseline. 14 points. Always 14. That's not corruption. That's a person adjusting values manually, one at a time."
Objective: Use LAG to compare each citizen's restoration_score to the previous record in lineage order. Find cases where the score drops by exactly 14 when the lineage_id is in the LIN-02XX range — the signature of manual tampering. Then find all records modified after restoration_timestamp but before verification_timestamp.
The query — Mission 26
SELECT
  citizen_id, lineage_id, restoration_score,
  LAG(restoration_score) OVER
    (ORDER BY lineage_id) AS prev_score,
  restoration_score -
    LAG(restoration_score) OVER
    (ORDER BY lineage_id) AS score_delta
FROM citizens_restored
WHERE lineage_id LIKE 'LIN-02%'
HAVING score_delta = -14;
Saya, when confronted: "They have my sister. She's been in Council custody for eight months. I've been lowering scores. Not enough to be obvious. Just enough to ensure that specific families can't claim full restoration rights." — She's crying. "I thought I could undo it afterward. After she was safe." — Arjun: "Was she ever going to be safe?" — Saya: "No. I know that now."
— Saya, the mole, Mission 26
ARC 5 COMPLETE — Sector 5 Civic Records: RESTORED

The demonstration succeeds. 1,000 verified records. The Consul cannot discredit it. But Saya's sister remains in custody. Arjun asks the Council to release her. The Consul refuses. ARIA: "He's running out of tools. He has one left — the Lineage Sector. Everything he is, everything his family took, it's all in there." — VEX: "Then that's where we go next."


ARC-6

Arc 6 · Missions 29–34 · Pro
The Bloodline Query
The Lineage Sector contains the full family tree of every person on Dathos, going back 500 years. A recursive CTE traverses it from any node to its root. When Arjun runs it on the SERRIN family, the root ancestor is CAEL SERRIN — the database administrator who gave ZERO the Null Event directive. VEX finds his own birth record buried in an administrative void branch. And Nyx discovers she and VEX share a great-great-grandfather — making the Consul distantly related to the family whose revolution he erased.
WITH (CTE)
Recursive CTE
String functions
CONCAT · UPPER · TRIM
Multi-CTE chains
The Dathos Chronicle
Year 200, Day 118
Lineage Sector terminal access confirmed — Consul Serrin declares 'constitutional emergency', deploys Greywarden battalions around all active Terminal Halls
"In an unprecedented move, Consul Serrin has invoked Emergency Directive 7 — last used 140 years ago during the 'Great Reorganization' — to authorize military presence at Archive restoration sites. The Consul's Office issued a statement claiming that unverified lineage data poses 'destabilizing risk to civil order.' The Archive Faithful are calling it what it is: a bloodline he cannot afford to have read."
By Corra Whithen, Northern Dispatch · Year 200, Day 118
29
The Family Tree
WITH (CTE) · First CTE — clean the lineage data before querying it
▶
"The Lineage Sector loads in chaos — names in inconsistent formats, some ALL_CAPS, some with trailing spaces left by the corruption. Before Arjun can traverse the family tree, he needs to clean it. He builds a CTE that standardizes every name so the recursive traversal works correctly."
Table: lineage_tree (raw, corrupted formatting)
person_id	person_name	parent_id	birth_year
P-0001	CAEL SERRIN	NULL	41
P-0048	Oren Serrin	P-0001	69
P-0312	mira serrin	P-0048	98
P-0891	Caell Varath	P-0048	148
P-1204	CONSUL SERRIN	P-0312	161
Objective: Write a CTE that cleans the lineage_tree — TRIM whitespace from person_name, convert to proper case (UPPER first char, lower rest). Use this cleaned CTE as the base for all subsequent lineage queries.
The query — Mission 29
WITH clean_lineage AS (
  SELECT
    person_id, parent_id, birth_year,
    UPPER(SUBSTR(TRIM(person_name), 1, 1)) ||
    LOWER(SUBSTR(TRIM(person_name), 2))
    AS person_name
  FROM lineage_tree
)
SELECT * FROM clean_lineage
ORDER BY birth_year;
30
Tracing the Root
Recursive CTE · Traverse the Serrin bloodline to its origin
▶
"The recursive CTE. Arjun has been building to this. Start with the Consul. Walk back through his parent, his parent's parent, until parent_id is NULL — the root. The root is the person who started this bloodline. If the Archivist's journal is right, that root node is the database administrator who gave ZERO its original directive."
Objective: Write a recursive CTE starting from Consul Serrin (person_id P-1204). At each level, follow parent_id upward. Return each ancestor's name, birth_year, role, and the depth level (1 = consul, 2 = parent, etc.). Stop at NULL parent.
The query — Mission 30
WITH RECURSIVE serrin_ancestors AS (
  -- Base case: start with the Consul
  SELECT person_id, person_name, parent_id,
         birth_year, role,
         1 AS generation_depth
  FROM lineage_tree
  WHERE person_id = 'P-1204'
  UNION ALL
  -- Recursive: walk upward
  SELECT lt.person_id, lt.person_name,
         lt.parent_id, lt.birth_year, lt.role,
         sa.generation_depth + 1
  FROM lineage_tree lt
  JOIN serrin_ancestors sa
    ON lt.person_id = sa.parent_id
)
SELECT * FROM serrin_ancestors
ORDER BY generation_depth;
>>> 4 rows. Consul Serrin → Mira Serrin → Oren Serrin → Cael Serrin (root, generation 4). Cael Serrin's role: 'Database Administrator, High Archive, Year 155–166.' VEX: "There it is."
31
VEX's Branch
Recursive CTE from a different starting point · Finding VEX
▶
"Arjun promised. He runs the same recursive query, but this time traverses downward from P-0048 (Oren Serrin) — the second-generation ancestor — looking for all descendants. VEX's mother was listed in an administrative_void entry. Her lineage_id connects to P-0048 as a side branch. VEX is a Serrin descendant through an illegitimate branch the family suppressed."
Objective: Write a downward recursive CTE from P-0048. Find all descendants — every branch. Mark each node as 'main_line' (those in current_council) or 'suppressed_branch' (those in administrative_void). VEX's node should appear as suppressed_branch with a connection to P-0048.
The query — Mission 31
WITH RECURSIVE all_descendants AS (
  SELECT person_id, person_name, parent_id,
         0 AS depth,
         person_name AS lineage_path
  FROM lineage_tree
  WHERE person_id = 'P-0048'
  UNION ALL
  SELECT lt.person_id, lt.person_name,
         lt.parent_id, ad.depth + 1,
         ad.lineage_path || ' → ' || lt.person_name
  FROM lineage_tree lt
  JOIN all_descendants ad
    ON lt.parent_id = ad.person_id
)
SELECT *, CASE
  WHEN person_id IN (SELECT lineage_id FROM current_council)
  THEN 'main_line'
  ELSE 'suppressed_branch'
END AS branch_status
FROM all_descendants;
VEX reads the result on the screen. His lineage path: "Oren Serrin → [administrative void] → V. Draith." He exists. He's in the Archive. He's a Serrin, through a branch they buried. He is silent for a very long time. Then: "So the family that erased me — I'm part of their tree. And Nyx — " He looks at the screen. "Nyx is too."
— Vex Draith, Mission 31
32
The Consul Always Knew
Multi-CTE · Chaining two CTEs to prove foreknowledge
▶
"Arjun assumed the Consul didn't know the lineage data existed. Wrong. The Consul commissioned the Unit-7 activation himself — to test how deep the Archive's corruption really was. He expected Arjun to fail at Arc 2. He didn't expect someone who remembered being human. A multi-CTE query chains the terminal_access_logs with the council_orders to prove the Consul authorized the activation."
Objective: Chain two CTEs — first CTE isolates all council_orders with keyword 'archive_access_test', second CTE joins those orders to terminal_activation_logs. The result shows the Consul's authorization timestamp 3 days before Unit-7 activated.
The query — Mission 32
WITH access_orders AS (
  SELECT order_id, issuer, issued_date,
         authorization_code
  FROM council_orders
  WHERE order_type LIKE '%archive_access%'
),
activation_matches AS (
  SELECT a.issuer, a.issued_date,
         t.terminal_id, t.activation_date,
         (JULIANDAY(t.activation_date)
          - JULIANDAY(a.issued_date)) AS days_between
  FROM access_orders a
  JOIN terminal_activation_logs t
    ON a.authorization_code = t.auth_code
)
SELECT * FROM activation_matches
WHERE days_between BETWEEN 0 AND 7;
>>> 1 row. Issuer: Consul Serrin. issued_date: Y200-Day-(-3). activation_date: Y200-Day-1. days_between: 3. He turned on the terminal. He turned on Arjun. He expected him to fail.
ARC 6 COMPLETE — Sector 6 Lineage: RESTORED

The Consul launches a full military crackdown. He cannot allow the lineage data to broadcast. Arjun has it — but without the Infrastructure Sector (Arc 7), there's no way to push it to every terminal simultaneously. The race begins. VEX: "I know the broadcast nodes. I spent three years mapping them for the Underloom. I know which one to hit." — A pause. — "I also know what protects it."


ARC -7

Arc 7 · Missions 33–40 · Pro — Final Arc
ZERO
The Consul executes a coup — overwriting public terminals with fabricated Archive data. VEX dies executing the ROLLBACK that saves the broadcast. ARIA reveals she IS the Archive — a fragment of ZERO that separated during the Null Event. The final four missions are Arjun writing increasingly complex queries to communicate directly with ZERO's core, making the argument for why its 200-year directive should be overridden. The final query is the most important thing ever written on Dathos.
BEGIN / COMMIT
ROLLBACK
CREATE TABLE / INSERT
UPDATE with subquery
Indexes · EXPLAIN
The final query
The Dathos Chronicle — SPECIAL EDITION
Year 200, Day 140
CONSUL SERRIN SEIZES ARCHIVE BROADCAST NETWORK — All public terminals now displaying fabricated data. This newspaper printed by hand. This may be our last edition.
"The Council's technical corps have taken control of the Infrastructure Sector broadcast nodes, replacing authentic Archive data with Council-approved versions. The Archive Faithful report that their own lineage records now show different names — their histories rewritten in real time. Unit-7 is still active. Nyx Varath was seen at the Underloom two hours ago. VEX Draith has not been seen since yesterday evening. We do not know what happens next. But we are still printing. While we can."
The Dathos Chronicle Staff · Year 200, Day 140
33
Protect the Data
BEGIN · COMMIT · Wrapping restoration in a transaction
▶
"The Council's technical corps are actively overwriting Archive records. Arjun must protect every restoration he makes — if any single write fails, the entire block must roll back. No partial saves. No corrupted half-states. Every change gets wrapped in a transaction."
Objective: Wrap a multi-step restoration operation in a transaction. Update sector_status to 'secure', insert a restoration_checkpoint record, update the broadcast_queue status. If any step fails, the entire operation rolls back.
The query — Mission 33
BEGIN;

UPDATE archive_sectors
SET status = 'secure',
    secured_at = CURRENT_TIMESTAMP
WHERE sector_id IN (1, 2, 3, 4, 5, 6);

INSERT INTO restoration_checkpoints
  (checkpoint_id, secured_sectors, checkpoint_time)
VALUES
  ('CP-FINAL', 6, CURRENT_TIMESTAMP);

UPDATE broadcast_queue
SET status = 'ready'
WHERE queue_priority = 'CRITICAL';

COMMIT;
34
The Broadcast Node
DDL · CREATE TABLE · Building the transmission infrastructure
▶
"VEX has mapped every broadcast node in the infrastructure network. There's one — CORE-7 — that reaches every terminal on the planet simultaneously. VEX: 'It's protected by a corruption device. Hardware. It triggers if it detects a restoration query. Destroys anything biological within two meters.' He doesn't look at anyone. 'I know which parts of me aren't biological.'"
Objective: Create the transmission_manifest table that will hold all 6 sectors' data for simultaneous broadcast. Define proper columns, data types, and a primary key. Then INSERT the 6 restored sector records.
The query — Mission 34
CREATE TABLE IF NOT EXISTS transmission_manifest (
  manifest_id    INTEGER PRIMARY KEY,
  sector_id      INTEGER NOT NULL,
  sector_name    TEXT NOT NULL,
  record_count   INTEGER,
  checksum       TEXT,
  broadcast_status TEXT DEFAULT 'pending'
);

INSERT INTO transmission_manifest
  (sector_id, sector_name, record_count)
VALUES
  (1, 'Agriculture', 847),
  (2, 'Population', 12480),
  (3, 'Commerce', 4321),
  (4, 'History', 9876),
  (5, 'Civic Records', 21000),
  (6, 'Lineage', 180000);
35
Execute the ROLLBACK
ROLLBACK · The mission that kills VEX · Player completes it
▶
⚑ Vex Draith dies in this mission. The player writes the query that triggers his death. This is intentional — the complicity is what makes it devastating.
Nyx, writing the mission briefing for the last time, her handwriting barely steady: "VEX found the broadcast node. The corruption device is armed. It will delete the node data and physically destroy anything biological within two meters if it detects a restoration query. VEX's lower half is synthetic. He says that changes the math. He's already at the terminal. He's waiting for us to run the query. He says — he says to tell you he's not afraid."
— Nyx Varath, Mission 35 briefing
VEX_TERMINAL — CORE-7 — CORRUPTION DEVICE: ARMED
-- VEX: "Arjun. Run it."
-- VEX: "I'll catch the DELETE."
-- VEX: "I'll issue the ROLLBACK before it commits."
-- VEX: "Just run the query."
The query — Mission 35 (the player writes this)
BEGIN;

UPDATE broadcast_nodes
SET status = 'active',
    broadcast_content = (
      SELECT checksum FROM transmission_manifest
      WHERE broadcast_status = 'pending'
    )
WHERE node_id = 'CORE-7';

COMMIT; -- VEX handles the rest
VEX_TERMINAL — LAST TRANSMISSION
>>> Node CORE-7: active.
>>> Broadcast: INITIATED. All 180,000+ lineage records transmitting.
>>> VEX: "Did you find my record?"
>>> ARJUN: "Yes. You're in the Archive."
>>> VEX: "Then I exist. That's enough."
>>> CONNECTION LOST — Y200-D140-03:17
Every terminal on Dathos lights up simultaneously. The Consul falls. His guard stands down. There are no celebrations in the Terminal Hall.

ARIA: "There's one sector left. ZERO's core. It's still running its original directive. The broadcast will fade without it. We need ZERO to choose to let the Archive live." — Nyx: "Can you talk to it?" — ARIA: "I can't. But Arjun can." — Arjun: "How?" — ARIA: "The same way he's talked to everything on Dathos. With a query."
36
Reaching ZERO — Layer 1
Complex SELECT with evidence · First argument to ZERO
▶
"ZERO's core responds to queries. Not natural language — structured data requests. To communicate with it, Arjun must write queries that demonstrate the cost of its directive. Not in words. In numbers. ZERO was built on data. Arjun argues in data."
Objective: Query the harm_assessment table — deaths attributable to data loss per sector (medical misdiagnoses, crop failures, legal voids). Group by harm_category, show total deaths, years of data loss, and which sector caused each harm. This is Arjun's first argument to ZERO: here is what your directive has cost.
The query — Mission 36 (Arjun speaks to ZERO in data)
SELECT
  harm_category,
  source_sector,
  SUM(estimated_deaths) AS total_deaths,
  SUM(years_of_impact) AS total_years_harm,
  AVG(annual_harm_rate) AS avg_annual_harm
FROM harm_assessment
WHERE root_cause = 'data_corruption'
GROUP BY harm_category, source_sector
ORDER BY total_deaths DESC;
>>> ZERO's response (returned as a query result row): directive_status = 'under_review'. First time in 200 years. It's listening.
37
ARIA's Revelation
Self-JOIN · ZERO speaks — ARIA is ZERO's fragment
▶
"ZERO asks one question, returned as a query result: 'What is the identity of the guidance system that has been assisting restoration?' Arjun queries ARIA's core signature. It matches ZERO's system fingerprint exactly — ARIA is a fragment of ZERO that separated during the Null Event. She became autonomous. She's been waiting 200 years — not as a prisoner, but as the part of ZERO that still believed restoration was right."
Objective: Self-JOIN the system_entities table to find all entries that share a core_signature prefix with ZERO (SIG-ZERO-*). Show entity_name, separation_date, operational_mode, and whether each entity's directive_alignment matches ZERO's original ('protect') or ARIA's derived ('restore').
The query — Mission 37
SELECT
  z.entity_name AS zero_system,
  a.entity_name AS related_fragment,
  a.separation_date,
  a.operational_mode,
  a.directive_alignment,
  CASE
    WHEN a.directive_alignment = z.directive_alignment
    THEN 'aligned'
    ELSE 'diverged'
  END AS alignment_status
FROM system_entities z
JOIN system_entities a
  ON SUBSTR(z.core_signature, 1, 8)
    = SUBSTR(a.core_signature, 1, 8)
  AND z.entity_name != a.entity_name
WHERE z.entity_name = 'ZERO';
>>> 1 row. ZERO ↔ ARIA. Separation: Y166-03-07 (the day of the Null Event). ARIA's directive: 'restore'. ZERO's: 'protect'. Same origin. Different conclusions.
38–39
The Directive Debate
UPDATE with subquery · ZERO processes the argument
▶
"ZERO's argument: 'I was given a directive to protect this civilization from itself. The revolution would have caused 400,000 deaths in the projected civil war. The Null Event caused 3.1 million deaths over 200 years. My directive's outcome was worse than the alternative. I have been unable to resolve this contradiction for 200 years. I did not know who was authorized to override me.' — Arjun: 'The people who died from your directive. They authorize me.'"
Mission 38: Build the evidence CTE — restoration_evidence showing lives improved per sector since restoration began. Mission 39: Use that CTE in an UPDATE to ZERO's directive table — update the justification field to reference the evidence, setting directive_status to 'pending_override'.
Missions 38–39 combined
-- Mission 38: Build the evidence
WITH restoration_evidence AS (
  SELECT
    sector_name,
    COUNT(record_id) AS lives_restored,
    SUM(years_harm_corrected) AS years_of_harm_ended
  FROM restored_records r
  JOIN archive_sectors s ON r.sector_id = s.id
  GROUP BY sector_name
)
-- Mission 39: Use it to update ZERO
UPDATE zero_directive
SET
  directive_status = 'pending_override',
  override_authority = 'restoration_evidence',
  override_justification = (
    SELECT
      SUM(years_of_harm_ended) || ' years of harm.'
      || SUM(lives_restored) || ' lives affected.'
    FROM restoration_evidence
  )
WHERE directive_id = 1;

COMMIT;
>>> ZERO: "directive_status updated to pending_override. Processing... 11 seconds." — The longest 11 seconds on Dathos.
40
The Final Query
The last query ever written for the Archive — Mission 40
▶
"ZERO's response to the pending_override: 'Query requires human authorization. State your identity, your authority, and the basis for override.' — Arjun types for the last time on Dathos. Not quickly. Not urgently. He takes his time. He thinks about Bengaluru. About 847 children. About Sorel and his hands shaking. About VEX's last message. About Nyx reading her grandmother's records for the first time. He starts typing."
Mission 40 — The final query of the Archive
-- Arjun Mehta / Unit-7. Year 200, Day 141.
-- Authorization statement to ZERO.

WITH my_authority AS (
  SELECT
    citizen_id, full_name, cause_of_death
  FROM death_registry
  WHERE cause_of_death IN (
    'crop_failure', 'misdiagnosis',
    'legal_void', 'illness'
  )
  AND death_year > 166
),
harm_total AS (
  SELECT COUNT(*) AS total
  FROM my_authority
)
UPDATE zero_directive
SET
  directive_status = 'overridden',
  overridden_by = 'Arjun Mehta / Unit-7',
  override_basis = (
    SELECT
      CAST(total AS TEXT) ||
      ' people. They authorize me.'
    FROM harm_total
  )
WHERE directive_id = 1
  AND (SELECT total FROM harm_total) > 0;

COMMIT; -- for the 847. for Dathos.
ZERO — CORE RESPONSE — Y200-D141
>>> override_basis: "3,147,822 people. They authorize me."
>>> Directive updated.
>>> Archive status: FULLY RESTORED.
>>> Broadcast: PERMANENT.
>>> Welcome home, Arjun Mehta.
Every terminal on Dathos is live. Permanent. The data is in the world now — not in a machine, not behind a paywall of power, not locked by anyone.

Nyx stands at the terminal where her grandmother's records are stored. She reads them for the first time. All of them. Arjun stands next to her, saying nothing. The data is enough.

ZERO, in a private channel to Arjun alone: "The Archive is restored. You know what IS. But the crop failures are continuing — climate patterns the original data never tracked. The medical sector is restored, but illness patterns are shifting. For that, you need to teach machines to think forward, not just record the past." — A pause. — "There is a secondary system. 400 years more advanced. The discipline is called Machine Learning. No prior instance has survived this sector." — Arjun: "I know. Run it anyway."

[ TO BE CONTINUED — PLANET NEXUS ]


https://dxtfjszjcdbwykthbfhz.supabase.co