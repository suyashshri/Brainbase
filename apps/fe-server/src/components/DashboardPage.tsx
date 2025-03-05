'use client';
import React from 'react';
import ChatPdf from '@/components/ChatPdf';
import PDFViewer from '@/components/PdfViewer';

const DashboardPage = ({ id, pdfUrl }: { id: string; pdfUrl: string }) => {
    return (
        <div className="flex max-h-screen">
            <div className="flex max-h-screen p-4 oveflow-scroll flex-[7]">
                {pdfUrl && <PDFViewer pdf_url={pdfUrl} />}
            </div>
            <div className="flex-[3] max-h-screen border-l-4 border-l-slate-200">
                <ChatPdf documentId={id} />
            </div>
        </div>
    );
};

export default DashboardPage;
