"use client"
import { useState, useEffect, ChangeEvent } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, getDoc, query, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Fade } from 'react-awesome-reveal';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from 'next/image';
import moment from "moment"
import { validate } from './services/validate';

interface Sentence {
  text: string;
  createdAt: Date;
  deviceIdentifier: string;
}

export default function Home() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [newSentence, setNewSentence] = useState('');
  const [summary, setSummary] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [deviceIdentifier, setDeviceIdentifier] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();
      setDeviceIdentifier(visitorId);
    })();
  }, []);

  const fetchSummary = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'summary/shortsummary'));
      if (docSnap.exists()) {
        setSummary(docSnap.data().text);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchSentences = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'dailyStory'), orderBy('createdAt')));
      const sentencesArray = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Sentence & { createdAt: Timestamp };;
        return {
          ...data,
          createdAt: data.createdAt.toDate() as Date,
        };
    });
      setSentences(sentencesArray);
      const lastAddedTime = sentencesArray.length > 0 ? sentencesArray[sentencesArray.length - 1]?.createdAt : null;
      setLastUpdated(moment(lastAddedTime).fromNow());
    } catch (error) {
      console.error('Error fetching sentences:', error);
    }
  };

  useEffect(() => {
    fetchSentences();
    fetchSummary();
  }, []);

  const addSentence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true)
    const trimmedSentence = newSentence.trim();

    if (!trimmedSentence) {
      setError('Please enter a sentence.');
      setIsLoading(false)
      return;
    }

    if (trimmedSentence.length < 10) {
      setError('Please ensure your sentence is at least 10 characters long.');
      setIsLoading(false)
      return;
    }

    if (trimmedSentence.length > 200) {
      setError('Your sentence should be within 200 characters.');
      setIsLoading(false)
      return;
    }

    const sortedSentences = [...sentences].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const lastSubmission = sortedSentences.find((sentence) => sentence.deviceIdentifier === deviceIdentifier);

    if (lastSubmission && (Date.now() - lastSubmission.createdAt.getTime()) < 60 * 60 * 1000) { // 1 hour in ms
      setError('Each device can submit once per hour to ensure everyone gets a fair chance. Please return later to contribute again. Thank you for your patience!');
      setIsLoading(false)
      return;
    }

    
    try {
      const parsedJson = await validate(sentences,trimmedSentence)
      if (parsedJson.isValid === "yes") {
        await addDoc(collection(db, 'dailyStory'), {
          text: parsedJson.sentence,
          createdAt: new Date(),
          deviceIdentifier: deviceIdentifier,
        });
        await updateDoc(doc(db, 'summary/shortsummary'), {
          text: parsedJson.updatedSummary,
        });
        fetchSummary();
        setNewSentence('');
        fetchSentences();
        setError(null);
      } else {
        setError(parsedJson.message);
      }
    } catch (error) {
      console.error('Error adding sentence:', error);
      setError("We apologize, but we couldn't add your sentence. Please try again later.");
    }

    setIsLoading(false)
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewSentence(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-2xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-6">
       <div className='flex items-center gap-4 justify-center' >
        <Image src={"/icon.png"} width={60} height={60} alt='icon'/>
       <h1 className="text-4xl font-bold text-center">Endless Chain Story</h1>
       </div>
        <div className="bg-card rounded-md shadow-sm overflow-hidden p-2">
          <div className="px-6 py-4">
            <div className='flex justify-between'>
              <p className="text-muted-foreground text-sm md:text:md">📖 The ongoing story so far:</p>
              <div>
                <p className="text-muted-foreground text-sm md:text:md text-center">⌛ Last Update: {lastUpdated}</p>
                <div className='flex justify-center gap-3'>
                <Dialog>
  <DialogTrigger>
    <p className='text-xs text-blue-600 underline'>Rules</p>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Participation Guidelines</DialogTitle>
      <DialogDescription>
        <ol className="list-decimal list-inside space-y-2">
          <li>Please ensure your sentence is between 10 and 200 characters.</li>
          <li>You can submit one sentence per hour from each device. This helps ensure everyone has a fair chance to participate.</li>
          <li>Ensure your sentence fits logically and coherently with the ongoing story.</li>
          <li>Please keep your sentence in English and avoid repetitions.</li>
        </ol>
        <p className="mt-4">Let's build an amazing story together! 📖</p>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

                  <Dialog>
                    <DialogTrigger>
                      <p className='text-xs text-blue-600 underline'>Short Summary</p>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Short Summary</DialogTitle>
                        <DialogDescription>
                          {summary}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            <div className="mt-2 prose text-foreground max-w-none">
              {sentences.map((sentence, index) => (
                <Fade triggerOnce duration={2000} key={index}>{sentence.text}</Fade>
              ))}
            </div>
          </div>
          <form className="flex gap-2 m-2" onSubmit={addSentence}>
            <Input type="text" placeholder="Add your sentence..." className="flex-1" value={newSentence}
              onChange={handleInputChange} />
            <Button type="submit" disabled={isLoading} >Submit</Button>
          </form>
          {error && <p className="text-red-500 text-sm px-6">{error}</p>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Be a part of an endless chain story by adding your sentence.
      </p>
    </div>
  );
}
