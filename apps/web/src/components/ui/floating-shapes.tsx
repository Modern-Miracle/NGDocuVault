import { motion } from 'framer-motion';

const FloatingShapes = () => {
  const shapes = [
    { size: 'w-2 h-2', color: 'bg-blue-400', top: '10%', left: '15%', delay: 0 },
    { size: 'w-3 h-3', color: 'bg-indigo-400', top: '20%', right: '20%', delay: 1 },
    { size: 'w-4 h-4', color: 'bg-purple-400', bottom: '30%', left: '10%', delay: 2 },
    { size: 'w-2 h-2', color: 'bg-cyan-400', bottom: '20%', right: '25%', delay: 1.5 },
    { size: 'w-5 h-5', color: 'bg-pink-400', top: '40%', left: '80%', delay: 0.5 },
    { size: 'w-3 h-3', color: 'bg-emerald-400', top: '60%', right: '15%', delay: 2.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute ${shape.size} ${shape.color} rounded-full opacity-20`}
          style={{
            top: shape.top,
            bottom: shape.bottom,
            left: shape.left,
            right: shape.right,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8 + shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;