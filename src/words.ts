export type Question = {
  id: number
  question: string
  answer: string
}

const questions: Question[] = [
  { id: 1, question: 'What parallel dark world exists beneath Hawkins?', answer: 'UpsideDown' },
  { id: 2, question: 'What creature hunts from the alternate dimension?', answer: 'Demogorgon' },
  { id: 3, question: 'What basketball team did Lucas win the championship with?', answer: 'Hawkins Tigers' },
  { id: 4, question: 'What interdimensional opening connects both worlds?', answer: 'Gate' },
  { id: 5, question: 'Who does Robin have a crush on in Season 4?', answer: 'Vickie' },
  { id: 6, question: 'What terrifying shadow monster controls the Upside Down?', answer: 'Mindflayer' },
  { id: 7, question: 'What small town is plagued by supernatural events?', answer: 'Hawkins' },
  { id: 8, question: 'Who leads the Hellfire Club at Hawkins High?', answer: 'Eddie Munson' },
  { id: 9, question: 'What is the name of Dustin’s girlfriend from summer camp?', answer: 'Suzie' },
  { id: 10, question: 'What role-playing game do the kids love playing together?', answer: 'Dungeons Dragons' },
  { id: 11, question: 'What ice cream shop is located inside Starcourt Mall?', answer: 'Scoops Ahoy' },
  { id: 12, question: 'Who cracks the Russian code coming from Dustin’s radio?', answer: 'Robin' },
  { id: 13, question: 'What hairspray does Steve use?', answer: 'Farrah Fawcett hairspray' },
  { id: 14, question: 'What illness caused Hopper’s daughter’s death?', answer: 'Cancer' },
  { id: 15, question: 'What nickname does Eleven use for Dr. Brenner?', answer: 'Papa' },
  { id: 16, question: 'What mall becomes the main location in Season Three?', answer: 'Starcourt Mall' },
  { id: 17, question: 'What arcade game do the boys play at the Palace Arcade?', answer: 'DigDug' },
  { id: 18, question: 'What food does Eleven love to eat?', answer: 'Eggo waffles' },
  { id: 19, question: 'What creature killed Bob Newby?', answer: 'Demodog' },
  { id: 20, question: 'What is the name of the Russian scientist who loves Slurpees?', answer: 'Alexei' },
  { id: 21, question: 'What number is Kali known as?', answer: 'Eight' },
  { id: 22, question: 'What costumes do the boys wear for Halloween?', answer: 'Ghost busters' },
  { id: 23, question: 'What job does Billy have in Season Three?', answer: 'Lifeguard' },
  { id: 24, question: 'What is the name of the lab playroom for gifted children?', answer: 'Rainbow Room' },
  { id: 25, question: 'Where does Bob Newby work in Hawkins?', answer: 'Radio Shack' },
  { id: 26, question: 'Which city does Eleven travel to find Kali?', answer: 'Chicago' },
  { id: 27, question: 'What is Eleven’s birth name?', answer: 'Jane Ives' },
  { id: 28, question: 'Who investigates Barb’s disappearance in Season Two?', answer: 'Murray Bauman' },
  { id: 29, question: 'What monster is held captive in the Russian prison?', answer: 'Demogorgon' },
  { id: 30, question: 'What is Vecna’s name before becoming a monster?', answer: 'Henry Creel' },
]

export function getQuestionById(id: number): Question | null {
  return questions.find((q) => q.id === id) ?? null
}

export function getQuestions(): Question {
  if (questions.length === 0) {
    throw new Error('No questions available')
  }
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
  return randomQuestion ?? questions[0]!
}
