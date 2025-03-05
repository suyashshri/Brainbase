'use client';

import DashboardPage from '@/components/DashboardPage';
import { HTTP_BACKEND } from '@/config';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Page = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id')?.toString();
    const { getToken } = useAuth();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!id) return;
            const token = await getToken();
            try {
                const response = await axios.get(
                    `${HTTP_BACKEND}/user/documents/${id}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log(process.env.NEXT_PUBLIC_S3_BUCKET_URL);

                setPdfUrl(
                    `https://brainbasebucket.s3.ap-south-1.amazonaws.com/${response.data.document.fileKey}`
                );
            } catch (error) {
                console.log('Failed to fetch PDF:', error);
                return;
            }
        })();
    }, [id, getToken]);
    return (
        <>
            {id && pdfUrl ? (
                <DashboardPage id={id} pdfUrl={pdfUrl} />
            ) : (
                'Loading...'
            )}
        </>
    );
};

export default Page;
