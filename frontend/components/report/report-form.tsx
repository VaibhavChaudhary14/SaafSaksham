"use client";

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Compressor from 'compressorjs';
import { Camera, RefreshCw, Send, CheckCircle } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';
import { submitReport } from '@/lib/api';

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
};

export default function ReportForm() {
    const webcamRef = useRef<Webcam>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const location = useLocation();

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImageSrc(imageSrc);
            // Convert base64 to blob/file
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    new Compressor(blob, {
                        quality: 0.6,
                        success(result) {
                            setFile(result as File);
                        },
                    });
                });
        }
    }, [webcamRef]);

    const handleSubmit = async () => {
        if (!file || !location.latitude || !location.longitude) return;
        setLoading(true);
        try {
            await submitReport(file, { latitude: location.latitude, longitude: location.longitude }, "garbage", "Reported via SaafSaksham");
            setSuccess(true);
            setImageSrc(null);
            setFile(null);
        } catch (error) {
            alert("Failed to report");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold">Report Submitted!</h2>
                <button onClick={() => setSuccess(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded">
                    Report Another
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4 p-4 max-w-md mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-video">
                {!imageSrc ? (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img src={imageSrc} alt="captured" className="w-full h-full object-cover" />
                )}
            </div>

            <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow">
                <div className="text-sm">
                    <p className="font-semibold">Location Status</p>
                    <p className={location.loading ? "text-yellow-500" : location.error ? "text-red-500" : "text-green-500"}>
                        {location.loading ? "Locating..." : location.error ? "Error" : "GPS Locked"}
                    </p>
                </div>

                {!imageSrc ? (
                    <button onClick={capture} className="p-4 rounded-full bg-blue-600 text-white shadow-lg">
                        <Camera className="w-6 h-6" />
                    </button>
                ) : (
                    <div className="flex gap-4">
                        <button onClick={() => { setImageSrc(null); setFile(null); }} className="p-4 rounded-full bg-gray-600 text-white shadow-lg">
                            <RefreshCw className="w-6 h-6" />
                        </button>
                        <button onClick={handleSubmit} disabled={loading || !location.latitude} className="p-4 rounded-full bg-green-600 text-white shadow-lg disabled:opacity-50">
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
