import { useEffect, useRef, useState } from 'react';

export function useQuickAccessSaveState(data) {
    const [isDirty, setIsDirty] = useState(false);
    const initialSnapshotRef = useRef(null);

    useEffect(() => {
        if (!initialSnapshotRef.current) {
            initialSnapshotRef.current = structuredClone(data);
            return;
        }

        setIsDirty(JSON.stringify(initialSnapshotRef.current) !== JSON.stringify(data));
    }, [data]);

    const markClean = () => {
        initialSnapshotRef.current = structuredClone(data);
        setIsDirty(false);
    };

    return { isDirty, markClean };
}
