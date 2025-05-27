import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface QuestionnaireItemProps {
  question: string
  answer: string
  details?: string
  policyLink?: string
  onEdit?: () => void
}

export default function QuestionnaireItem({ question, answer, details, policyLink, onEdit }: QuestionnaireItemProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-base font-normal text-gray-900 leading-relaxed mb-4">{question}</h3>

            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-900">Ans: </span>
                <span className="text-gray-900">{answer}</span>
                {details && <span className="text-gray-500 italic ml-1">{details}</span>}
              </div>

              {policyLink && (
                <Link href={policyLink} className="text-blue-600 hover:text-blue-800 underline text-sm">
                  View Policy
                </Link>
              )}
            </div>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onEdit}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-sm font-medium"
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
