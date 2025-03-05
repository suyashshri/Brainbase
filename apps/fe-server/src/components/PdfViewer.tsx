'use client';
import React from 'react';

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
    return (
        <>
            {pdf_url ? (
                <iframe src={pdf_url} className="w-full h-screen"></iframe>
            ) : (
                <p>Loading PDF...</p>
            )}
        </>
    );
};

export default PDFViewer;
