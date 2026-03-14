/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
	const candidateMap = new Map();
	const votes = {};
	const registeredVoters = new Set();
	const votedVoters = new Set();

	if (Array.isArray(candidates)) {
		for (const c of candidates) {
			candidateMap.set(c.id, c);
			votes[c.id] = 0;
		}
	}

	return {
		registerVoter(voter) {
			if (
				!voter ||
				typeof voter.id !== "string" ||
				typeof voter.name !== "string" ||
				typeof voter.age !== "number" ||
				voter.age < 18 ||
				registeredVoters.has(voter.id)
			) {
				return false;
			}

			registeredVoters.add(voter.id);
			return true;
		},

		castVote(voterId, candidateId, onSuccess, onError) {
			if (
				typeof onSuccess !== "function" ||
				typeof onError !== "function"
			) {
				return null;
			}

			if (!registeredVoters.has(voterId)) {
				return onError("voter not registered");
			}

			if (!candidateMap.has(candidateId)) {
				return onError("candidate not found");
			}

			if (votedVoters.has(voterId)) {
				return onError("already voted");
			}

			votes[candidateId] += 1;
			votedVoters.add(voterId);

			return onSuccess({ voterId, candidateId });
		},

		getResults(sortFn) {
			const results = Array.from(candidateMap.values()).map((c) => ({
				id: c.id,
				name: c.name,
				party: c.party,
				votes: votes[c.id] || 0,
			}));

			if (typeof sortFn === "function") {
				return results.sort(sortFn);
			}

			return results.sort((a, b) => b.votes - a.votes);
		},

		getWinner() {
			let winner = null;
			let maxVotes = 0;

			for (const c of candidateMap.values()) {
				const v = votes[c.id] || 0;

				if (v > maxVotes) {
					maxVotes = v;
					winner = { ...c };
				}
			}

			if (maxVotes === 0) return null;
			return winner;
		},
	};
}

export function createVoteValidator(rules) {
	const minAge = rules?.minAge ?? 18;
	const requiredFields = Array.isArray(rules?.requiredFields)
		? rules.requiredFields
		: [];

	return function (voter) {
		if (!voter || typeof voter !== "object") {
			return { valid: false, reason: "invalid voter object" };
		}

		for (const field of requiredFields) {
			if (!(field in voter)) {
				return { valid: false, reason: `missing ${field}` };
			}
		}

		if (typeof voter.age !== "number" || voter.age < minAge) {
			return { valid: false, reason: "age requirement not met" };
		}

		return { valid: true, reason: null };
	};
}

export function countVotesInRegions(regionTree) {
	if (!regionTree || typeof regionTree !== "object") return 0;

	const currentVotes =
		typeof regionTree.votes === "number" ? regionTree.votes : 0;

	const subs = Array.isArray(regionTree.subRegions)
		? regionTree.subRegions
		: [];

	return (
		currentVotes + subs.reduce((sum, r) => sum + countVotesInRegions(r), 0)
	);
}

export function tallyPure(currentTally, candidateId) {
	const base =
		currentTally && typeof currentTally === "object" ? currentTally : {};

	return {
		...base,
		[candidateId]: (base[candidateId] || 0) + 1,
	};
}
