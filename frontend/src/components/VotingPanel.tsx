import React, { useState, useEffect } from "react";
import {
  Vote,
  Zap,
  Users,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import {
  getCandidates,
  voteForCandidate,
  getVoteCounts,
} from "../utils/blockchainHelpers";
import { notification } from "../utils/notification";

interface Candidate {
  id: number;
  name: string;
  party: string;
  image: string;
  slogan: string;
  platform: string[];
}

const VotingPanel = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteCount, setVoteCount] = useState<number[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [credentialBundle, setCredentialBundle] = useState<string>("");
  const [credential, setCredential] = useState<any>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [voteSuccessful, setVoteSuccessful] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const candidatesFromChain = await getCandidates();
        setCandidates(candidatesFromChain);
        const counts = await getVoteCounts();
        setVoteCount(counts);
      } catch (err: any) {
        setError(err.message || "Failed to load blockchain data");
        notification.error("Failed to connect to blockchain");
      }
      setLoading(false);
    }
    loadData();

    const interval = setInterval(async () => {
      try {
        const counts = await getVoteCounts();
        setVoteCount(counts);
      } catch {
        /* silent */
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadCredential = () => {
    try {
      const parsed = JSON.parse(credentialBundle);
      if (parsed.credential && parsed.signature) {
        setCredential(parsed.credential);
        setSignature(parsed.signature);
        notification.success("Credential loaded & verified!");
      } else {
        throw new Error("Invalid credential format.");
      }
    } catch (err) {
      notification.error("Failed to parse credential JSON");
    }
  };

  const handleVote = async (candidateId: number) => {
    if (!credential || !signature) {
      return notification.error("Please load your voter credential first");
    }

    const notificationId = notification.loading(
      "Casting your vote to the blockchain...",
    );
    try {
      setSelectedCandidate(candidateId);
      await voteForCandidate(candidateId, credential, signature);

      notification.remove(notificationId);
      notification.success("Vote successfully recorded!");

      const counts = await getVoteCounts();
      setVoteCount(counts);
      setVoteSuccessful(true);
    } catch (err: any) {
      notification.remove(notificationId);
      if (err.message?.includes("Credential has already been used")) {
        notification.error("This credential has already been used");
      } else {
        notification.error(err.message || "Vote failed");
      }
    } finally {
      setSelectedCandidate(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="font-bold text-xl animate-pulse">
          Syncing with Blockchain...
        </p>
      </div>
    );
  }

  const totalVotes = voteCount.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-16 animate-in fade-in duration-700">
      {/* 1. Identity Portal */}
      <div className="card bg-base-100 shadow-xl border-t-8 border-primary max-w-4xl mx-auto w-full">
        <div className="card-body gap-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
                <h2 className="card-title text-2xl font-black">
                  Identity Portal
                </h2>
              </div>
              <p className="text-base-content/70">
                Paste your{" "}
                <span className="badge badge-secondary font-bold">
                  Verifiable Credential
                </span>{" "}
                below to unlock your secure ballot.
              </p>

              <div className="form-control">
                <textarea
                  value={credentialBundle}
                  onChange={(e) => setCredentialBundle(e.target.value)}
                  placeholder='{ "credential": { ... }, "signature": "0x..." }'
                  className="textarea textarea-bordered h-32 font-mono text-xs bg-base-200 focus:textarea-primary"
                />
              </div>

              <button
                onClick={handleLoadCredential}
                className="btn btn-primary btn-block shadow-lg font-black text-lg uppercase tracking-tight"
              >
                Verify & Unlock Ballot
              </button>
            </div>

            <div className="w-full md:w-64 bg-base-200 rounded-3xl p-6 flex flex-col items-center justify-center border border-base-300">
              {credential ? (
                <div className="text-center animate-bounce-short">
                  <ShieldCheck className="w-16 h-16 text-success mx-auto mb-2" />
                  <span className="badge badge-success font-black px-4 py-3">
                    AUTHENTICATED
                  </span>
                  <p className="text-[10px] mt-4 opacity-50 font-mono">
                    ID: {credential.nonce.slice(0, 12)}...
                  </p>
                </div>
              ) : (
                <div className="text-center opacity-30">
                  <ShieldAlert className="w-16 h-16 mx-auto mb-2" />
                  <p className="font-black uppercase">Awaiting ID</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ballot Box */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tight">The Ballot Box</h2>
          <p className="text-base-content/60">
            Choose your representative for the 2026 Election
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {candidates.map((candidate) => {
            const isDisabled =
              !credential || !!selectedCandidate || voteSuccessful;
            return (
              <div
                key={candidate.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 overflow-hidden group"
              >
                <div className="h-2 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="card-body items-center text-center p-10">
                  <div className="avatar mb-6">
                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden shadow-lg">
                      <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <h3 className="card-title text-3xl font-black">
                    {candidate.name}
                  </h3>
                  <div className="badge badge-outline badge-lg font-black opacity-70 mb-4 uppercase tracking-widest">
                    {candidate.party}
                  </div>

                  <p className="italic text-base-content/70 mb-6 font-serif text-lg leading-relaxed">
                    "{candidate.slogan}"
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {candidate.platform.map((p, i) => (
                      <span
                        key={i}
                        className="badge badge-ghost badge-sm py-3 px-4 font-bold uppercase text-[10px] tracking-tighter"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleVote(candidate.id)}
                    disabled={isDisabled}
                    className={`btn btn-lg btn-block rounded-2xl shadow-xl font-black text-xl uppercase tracking-tighter transition-all active:scale-95 border-2 ${
                      voteSuccessful
                        ? "btn-success text-white border-success bg-success"
                        : "btn-primary text-primary-content border-primary bg-primary hover:bg-primary/90 hover:border-primary-focus"
                    } disabled:bg-base-300 disabled:border-base-300 disabled:text-base-content/30`}
                  >
                    {selectedCandidate === candidate.id ? (
                      <span className="loading loading-spinner loading-md text-primary-content"></span>
                    ) : voteSuccessful ? (
                      "Ballot Cast ✓"
                    ) : (
                      "Cast Vote"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Live Tally */}
      <div className="card bg-neutral text-neutral-content shadow-2xl max-w-4xl mx-auto w-full overflow-hidden border-2 border-primary/20">
        <div className="card-body p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                Live Audit Log
              </h3>
            </div>
            <div className="badge badge-primary font-bold px-4 py-3">
              TOTAL: {totalVotes.toLocaleString()} VOTES
            </div>
          </div>

          <div className="space-y-10">
            {candidates.map((candidate) => {
              const count = voteCount[candidate.id] || 0;
              const percent = totalVotes ? (count / totalVotes) * 100 : 0;
              return (
                <div key={candidate.id} className="space-y-3">
                  <div className="flex justify-between font-bold">
                    <span>{candidate.name}</span>
                    <span className="text-primary font-mono">{count}</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full h-4 shadow-inner"
                    value={percent}
                    max="100"
                  ></progress>
                  <div className="flex justify-end">
                    <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">
                      {percent.toFixed(1)}% Share
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold opacity-50">
              <ExternalLink size={14} />
              VERIFIED ON SEPOLIA TESTNET
            </div>
            <p className="text-[10px] max-w-md leading-relaxed opacity-40 uppercase font-bold tracking-tighter">
              All transactions are cryptographically sealed. Any tampering
              attempt will invalidate the consensus chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingPanel;
