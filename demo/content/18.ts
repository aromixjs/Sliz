export default {
  name: "18 - server complex imports",
  expected: "stress",
  source: String.raw`<script server lang="ts">
import { default as React, useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { FC, ReactNode, ChangeEvent, KeyboardEvent } from "react";
import * as Utils from "./utils";
import { cloneDeep, merge, debounce } from "lodash-es";
import { css } from "@emotion/react";

type Props = {
    children: ReactNode;
    className?: string;
    onSubmit: (data: FormData) => Promise<void>;
};

const Component: FC<Props> = ({ children, className, onSubmit }) => {
    const [state, setState] = useState<{
        loading: boolean;
        error: string | null;
        data: Record<string, unknown>;
    }>({
        loading: false,
        error: null,
        data: {},
    });

    const ref = useRef<HTMLDivElement>(null);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setState(prev => ({
            ...prev,
            data: { ...prev.data, [name]: value },
        }));
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, []);

    const handleSubmit = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const formData = new FormData();
            Object.entries(state.data).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            await onSubmit(formData);
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : "Unknown error",
            }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const styles = useMemo(() => css\`
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    \`, []);

    return (
        <div ref={ref} css={styles} className={className}>
            {children}
        </div>
    );
};

export default Component;
</script>

<div>Server complex</div>`,
};
