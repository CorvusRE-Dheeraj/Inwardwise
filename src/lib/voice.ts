// Minimal browser recorder + playback helpers for conversational voice I/O.

export type Recorder = {
  stop: () => Promise<Blob>;
  cancel: () => void;
};

export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Pick the first mimeType the browser actually supports.
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
  ];
  const MR = window.MediaRecorder;
  const mimeType = candidates.find((t) => MR && MR.isTypeSupported && MR.isTypeSupported(t));

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  const stopStream = () => stream.getTracks().forEach((t) => t.stop());

  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          stopStream();
          resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
        };
        recorder.stop();
      }),
    cancel: () => {
      try {
        recorder.stop();
      } catch {
        /* noop */
      }
      stopStream();
    },
  };
}

export async function transcribe(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append("audio", blob, "recording");
  const res = await fetch("/api/transcribe", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Transcription failed" }));
    throw new Error(err.error || `Transcription failed: ${res.status}`);
  }
  const data = (await res.json()) as { text: string };
  return data.text ?? "";
}

export async function synthesizeSpeech(text: string): Promise<Blob> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Playback failed" }));
    throw new Error(err.error || `TTS failed: ${res.status}`);
  }
  return res.blob();
}
