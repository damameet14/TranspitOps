import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register ScrollTrigger globally with GSAP
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger, useGSAP };
