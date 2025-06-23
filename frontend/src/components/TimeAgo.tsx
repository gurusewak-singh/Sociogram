// frontend/src/components/TimeAgo.tsx
import React, { useEffect, useState } from 'react';
import { format } from 'timeago.js';

const TimeAgo = ({ timestamp }: { timestamp: string }) => {
    const [timeAgo, setTimeAgo] = useState(() => format(timestamp));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeAgo(format(timestamp));
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [timestamp]);

    return <span className="text-xs text-neutral-400 mt-1">{timeAgo}</span>;
};

export default TimeAgo;