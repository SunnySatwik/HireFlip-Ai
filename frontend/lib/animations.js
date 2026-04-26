// Framer Motion animation presets for HireFlip

export const fadeInUp = {
 initial: { opacity, y},
 animate: { opacity, y},
 exit: { opacity, y},
 transition: { duration, ease: 'easeOut' },
}

export const fadeIn = {
 initial: { opacity},
 animate: { opacity},
 exit: { opacity},
 transition: { duration},
}

export const slideInRight = {
 initial: { opacity, x: -50 },
 animate: { opacity, x},
 exit: { opacity, x: -50 },
 transition: { duration, ease: 'easeOut' },
}

export const slideInLeft = {
 initial: { opacity, x},
 animate: { opacity, x},
 exit: { opacity, x},
 transition: { duration, ease: 'easeOut' },
}

export const scaleIn = {
 initial: { opacity, scale},
 animate: { opacity, scale},
 exit: { opacity, scale},
 transition: { duration, ease: 'easeOut' },
}

export const containerVariants = {
 hidden: { opacity},
 visible: {
 opacity,
 transition: {
 staggerChildren,
 delayChildren,
 },
 },
}

export const itemVariants = {
 hidden: { opacity, y},
 visible: {
 opacity,
 y,
 transition: { duration, ease: 'easeOut' },
 },
}

export const hoverLift = {
 whileHover: { y: -8, transition: { duration} },
 whileTap: { scale},
}

export const pulseAnimation = {
 animate: {
 scale, 1.05, 1],
 transition: { duration, repeat, ease: 'easeInOut' },
 },
}

export const countUp = (duration = 2) => ({
 from,
 to,
 transition: { duration, ease: 'easeOut' },
})

export const shimmerAnimation = {
 animate: {
 backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
 transition: { duration, repeat, ease: 'linear' },
 },
}
