import { useState } from 'react'
import type { LevelStory } from '../types/index.ts'
import styles from './StoryPanel.module.css'

interface Props {
  levelId: number
  levelTitle: string
  story: LevelStory
  task: string
}

export function StoryPanel({ levelId, levelTitle, story, task }: Props) {
  const [hintVisible, setHintVisible] = useState(false)

  return (
    <div className={styles.panel}>
      <div className={styles.levelBadge}>Level {levelId}</div>
      <h1 className={styles.title}>{levelTitle}</h1>

      <div className={styles.message}>
        <div className={styles.character}>{story.character}</div>
        <p className={styles.text}>{story.message}</p>
      </div>

      <div className={styles.task}>
        <span className={styles.taskLabel}>Your task</span>
        <p className={styles.taskText}>{task}</p>
      </div>

      {story.hint && (
        <div className={styles.hintSection}>
          <button
            className={styles.hintToggle}
            onClick={() => setHintVisible(v => !v)}
          >
            {hintVisible ? 'Hide hint' : 'Need a hint?'}
          </button>
          {hintVisible && (
            <div className={styles.hint}>{story.hint}</div>
          )}
        </div>
      )}
    </div>
  )
}
