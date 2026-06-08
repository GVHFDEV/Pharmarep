'use client'

import { use } from 'react'
import { SurveyLiveMode } from '@/components/surveys/SurveyLiveMode'

export default function SurveyLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <SurveyLiveMode surveyId={id} />
}
