'use client';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from '@clerk/nextjs';
import { BrainCog } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './Theme-toggle';
import Link from 'next/link';

const Header = () => {
    return (
        <nav className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href={'/dashboard'}>
                    <div className="flex items-center gap-2">
                        <BrainCog className="h-8 w-8 text-primary animate-float" />
                        <span className="text-2xl font-bold text-primary font-outfit">
                            BrainBase
                        </span>
                    </div>
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    <SignedOut>
                        <SignInButton>
                            <Button variant="outline">Sign In</Button>
                        </SignInButton>
                        <SignUpButton>
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                                Get Started
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
};

export default Header;
