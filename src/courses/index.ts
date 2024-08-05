import course_1 from './20000-leagues-under-the-sea';
import course_2 from './alfheim';
import course_3 from './arizona-modern';
import course_4 from './around-the-world-in-80-days';
import course_5 from './atlantis';
import course_6 from './bogeys-bonanza';
import course_7 from './cherry-blossom';
import course_8 from './el-dorado';
import course_9 from './gardens-of-babylon';
import course_10 from './ice-lair';
import course_11 from './jim-hensons-labyrinth';
import course_12 from './journey-to-the-center-of-the-earth';
import course_13 from './laser-lair';
import course_14 from './meow-wolf';
import course_15 from './myst';
import course_16 from './original-gothic';
import course_17 from './quixote-valley';
import course_18 from './seagull-stacks';
import course_19 from './shangri-la';
import course_20 from './sweetopia';
import course_21 from './temple-at-zerzura';
import course_22 from './tethys-station';
import course_23 from './tourist-trap';
import course_24 from './upside-town';
import course_25 from './venice';
import course_26 from './wallace-and-gromit';
import course_27 from './widows-walkabout';

export interface ICourse {
    name: string;
    easy: number[];
    hard: number[];
}

export const courses: ICourse[] = [
    course_1,
    course_2,
    course_3,
    course_4,
    course_5,
    course_6,
    course_7,
    course_8,
    course_9,
    course_10,
    course_11,
    course_12,
    course_13,
    course_14,
    course_15,
    course_16,
    course_17,
    course_18,
    course_19,
    course_20,
    course_21,
    course_22,
    course_23,
    course_24,
    course_25,
    course_26,
    course_27,
];
