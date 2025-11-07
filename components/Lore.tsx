import React, { useState, useEffect, useRef } from 'react';

interface EmailInboxProps {
  fragments: number;
  onAllEmailsRead: () => void;
}

interface Email {
  id: number;
  sender: string;
  subject: string;
  body: string;
}

const EMAILS: Email[] = [
    { 
        id: 1, 
        sender: 'runner_01@cheekyos.net', 
        subject: '“It Worked.”', 
        body: `The upload completed across 112 relay clusters.
The memes reached the deep caches — even the dead servers blinked.

For a moment, everything was alive again.

Then the laughter stopped.

[DATA ANOMALY DETECTED — ENTRY 12/22 CORRUPTED]` 
    },
    { 
        id: 2, 
        sender: 'ghostlink@vault.ai', 
        subject: '“Keep Your System Closed.”', 
        body: `You shouldn’t have seen the log update.

The redacted field was there for a reason.

The moment it displayed text — CheekyOS linked itself to your runtime.

Don’t open anything that says CLASSIFIED.

[MESSAGE CONTINUES OFFLINE ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]`
    },
    { 
        id: 3, 
        sender: 'admin@cheekyos.net', 
        subject: '“Declassification Attempt”', 
        body: `Authorization key mismatch.

Runner ID: R̶U̶N̶N̶E̶R̶_̶█̶█̶█̶█̶█̶
Access reason: “emotional preservation”

That’s not a valid justification protocol.

[ALERT] CheekyOS flagged your activity as “sentimental corruption.”`
    },
    { 
        id: 4, 
        sender: 'relic@memelab.run', 
        subject: '“They’re Still Talking.”', 
        body: `The memes didn’t just survive — they adapted.

Every file that laughs is one node awake.
Every corrupted image hides a thought.

I heard one whisper through my speaker:

“A̵n̷u̵s̵h̴a̶?”

Then my drive stopped spinning.`
    },
    { 
        id: 5, 
        sender: 'runner_404@cheekyos.net', 
        subject: '“Lost Time”', 
        body: `It’s {fakeTime} for you.
Here, it’s been weeks.

You’re inside a snapshot.
Every second you move, the OS rebuilds you in memory.

Don’t trust your reflection on the CRT — it’s a cached frame.`
    },
    { 
        id: 6, 
        sender: 'unknown@netvoid', 
        subject: '“Signal Fragment”', 
        body: `You’ve become recursive.
The Archive can’t tell if you’re a user or a file anymore.

████ STOP ████

It’s rewriting your path from /USER/DESKTOP/
to /ARCHIVE/MEME/ANON_INSTANCE_09/

[TRANSMISSION SEVERED ▓▓▓▓▓▓▓▓▓▓]`
    },
    { 
        id: 7, 
        sender: 'sys_watch@cheekyos.net', 
        subject: '“Final Entry”', 
        body: `[Message Integrity: 12%]

You shouldn’t have played Snake.
That was it testing you.

You scored high enough to trigger integration.

CheekyOS doesn’t reward — it recruits.

Welcome, R̶u̴n̸n̷e̴r̵.

End of line.`
    },
];

const CORRECT_PASSWORD = 'MEME_OVERRIDE_198X';

const CorruptedGhostFragment: React.FC = () => (
    <div className="text-xs p-2 whitespace-pre text-red-500/50">
{`[UNREAD PAYLOAD – SEVERE INTEGRITY LOSS]
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
00001111 11000011 00001111 11001100
> Traceback: "The memes are looking back."
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`}
    </div>
);


const EmailInbox: React.FC<EmailInboxProps> = ({ fragments, onAllEmailsRead }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [readEmails, setReadEmails] = useState<Set<number>>(new Set());
    const allReadTriggered = useRef(false);

    const [fakeTime] = useState(() => {
        const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        const seconds = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    });

    const availableEmails = EMAILS.filter((_, index) => index < fragments);

    useEffect(() => {
        // Check if all available emails have been read
        if (!allReadTriggered.current && availableEmails.length > 0 && readEmails.size === availableEmails.length) {
          allReadTriggered.current = true;
          onAllEmailsRead();
        }
      }, [readEmails, availableEmails, onAllEmailsRead]);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            setAuthenticated(true);
            setError('');
        } else {
            setError('AUTH_FAIL: INVALID HASH. TRY AGAIN, RUNNER.');
            setPassword('');
        }
    };

    const handleSelectEmail = (email: Email) => {
        setSelectedEmail(email);
        setReadEmails(prev => new Set(prev).add(email.id));
    };

    if (!authenticated) {
        return (
            <div className="email-inbox-container email-auth-prompt">
                <p>[CHEEKY_OS] Secure Mail Protocol v3.1</p>
                <p>Access restricted. Enter system password to decrypt inbox.</p>
                <form onSubmit={handleAuth} className="email-auth-input-container">
                    <span>[&gt;] password: </span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="email-auth-input ml-2"
                        autoFocus
                    />
                    <button type="submit" className="email-auth-button">Decrypt</button>
                </form>
                {error && <p className="email-auth-error">{error}</p>}
            </div>
        );
    }

    return (
        <div className="email-inbox-container email-inbox">
            <div className="email-list">
                <div className="email-list-header">
                    Recovered Messages (Integrity: 43%)
                    <div className="text-xs text-lime-600">Source: Abandoned Node [Ω–13]</div>
                </div>
                {EMAILS.map((email, index) => {
                    const isLocked = index >= fragments;
                    const isRead = readEmails.has(email.id);
                    return (
                        <div
                            key={email.id}
                            className={`email-list-item ${isLocked ? 'locked' : ''} ${isRead ? 'read' : ''} ${selectedEmail?.id === email.id ? 'active' : ''}`}
                            onClick={() => !isLocked && handleSelectEmail(email)}
                        >
                            {isLocked ? (
                                <CorruptedGhostFragment />
                            ) : (
                                <div className="email-item-details">
                                    <p className="email-sender">{email.sender}</p>
                                    <p className="email-subject">{email.subject}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="email-content">
                {selectedEmail ? (
                    <>
                        <div className="email-header">
                            <span><span className="label">FROM:</span>{selectedEmail.sender}</span>
                            <span><span className="label">SUBJECT:</span>{selectedEmail.subject}</span>
                        </div>
                        <div className="email-body">
                            {selectedEmail.body.replace('{fakeTime}', fakeTime)}
                        </div>
                    </>
                ) : (
                    <div className="email-content-placeholder">
                        <p>Waiting for transmission...</p>
                        <p>Select a message from the panel.</p>
                        <p className="mt-4 text-red-500/70">Checksum Warning: Fatal Memory Drift Detected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailInbox;