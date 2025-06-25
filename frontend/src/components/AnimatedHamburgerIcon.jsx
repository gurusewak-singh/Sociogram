import React from 'react';
import { motion } from 'framer-motion';

const AnimatedHamburgerIcon = ({ isOpen, onClick }) => {
    const barVariants = {
        open: { rotate: 45, y: 8 },
        closed: { rotate: 0, y: 0 },
    };
    const middleBarVariants = {
        open: { opacity: 0 },
        closed: { opacity: 1 },
    };
    const bottomBarVariants = {
        open: { rotate: -45, y: -8 },
        closed: { rotate: 0, y: 0 },
    };

    return (
        <button onClick={onClick} className="w-8 h-8 flex flex-col justify-around items-center focus:outline-none">
            <motion.div
                className="w-6 h-0.5 bg-neutral-800 dark:bg-neutral-200 rounded-full"
                variants={barVariants}
                animate={isOpen ? "open" : "closed"}
                transition={{ duration: 0.3 }}
            ></motion.div>
            <motion.div
                className="w-6 h-0.5 bg-neutral-800 dark:bg-neutral-200 rounded-full"
                variants={middleBarVariants}
                animate={isOpen ? "open" : "closed"}
                transition={{ duration: 0.3 }}
            ></motion.div>
            <motion.div
                className="w-6 h-0.5 bg-neutral-800 dark:bg-neutral-200 rounded-full"
                variants={bottomBarVariants}
                animate={isOpen ? "open" : "closed"}
                transition={{ duration: 0.3 }}
            ></motion.div>
        </button>
    );
};

export default AnimatedHamburgerIcon;