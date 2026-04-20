import Quiz from "../models/Quiz.js";

export const getAllQuizzes = async (req, res, next) => {
    const userId = req.userId;
    try {
        const quizzes = await Quiz.find({ userId: req.userId })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
    } catch (error) {
        next(error);
    }
};

export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.userId,
            documentId: req.params.documentId
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.userId
        });
        if(!quiz){
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }
        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;  
    const { answers } = req.body;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    let correctCount = 0;
    const detailedResults = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers.find(
        (a) => a.questionId === question._id.toString()
      );

      // correctAnswer is now always stored as plain option text (normalized at generation time)
      const selectedAnswer = (userAnswer?.selectedAnswer || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const correctAnswer = (question.correctAnswer || '').toLowerCase().replace(/\s+/g, ' ').trim();
      
      const isCorrect = selectedAnswer !== '' && selectedAnswer === correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      detailedResults.push({
        questionId: question._id,
        question: question.question,
        selectedAnswer: userAnswer?.selectedAnswer || null,
        correctAnswer: question.correctAnswer, // return original casing in response
        isCorrect,
        explanation: question.explanation,
        });
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    quiz.score = score;
    quiz.totalQuestions = quiz.questions.length;
    quiz.completedAt = new Date();
    
    quiz.userAnswers = quiz.questions.map((question, index) => {
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      
      if (!userAnswer) {
        return {
          questionIndex: index,
          selectedAnswer: 'Not answered',
          isCorrect: false,
          answeredAt: new Date()
        };
      }

      const selectedAnswer = (userAnswer.selectedAnswer || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const correctAnswer = (question.correctAnswer || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const isCorrect = selectedAnswer !== '' && selectedAnswer === correctAnswer;
      
      return {
        questionIndex: index,
        selectedAnswer: userAnswer.selectedAnswer,
        isCorrect: isCorrect,
        answeredAt: new Date()
      };
    });

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        score,
        correctAnswers: correctCount,
        totalQuestions: quiz.questions.length,
        detailedResults,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    next(error);
  }
};

export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.userId
        }).populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz not completed yet',
                statusCode: 400
            }); 
        }

        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);

            // correctAnswer is always stored as plain text (normalized at generation time)
            return {
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer || null,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation
            };
        });

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions,
                },
                results: detailedResults
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if(!quiz){
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Toggle public sharing
export const toggleShareQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        quiz.isPublic = !quiz.isPublic;
        await quiz.save();

        res.status(200).json({
            success: true,
            data: { isPublic: quiz.isPublic }
        });
    } catch (error) {
        next(error);
    }
};

// Get public quiz (without correct answers)
export const getPublicQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            isPublic: true
        }).populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Public quiz not found' });
        }

        // Strip out correct answers and explanations for the public view
        const publicQuestions = quiz.questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty
        }));

        res.status(200).json({
            success: true,
            data: {
                _id: quiz._id,
                title: quiz.title,
                documentId: quiz.documentId,
                totalQuestions: quiz.totalQuestions,
                questions: publicQuestions
            }
        });
    } catch (error) {
        next(error);
    }
};

// Submit public quiz (grade but don't save to DB)
export const submitPublicQuiz = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        const quiz = await Quiz.findOne({ _id: id, isPublic: true });

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Public quiz not found' });
        }

        let correctCount = 0;
        const detailedResults = [];

        quiz.questions.forEach((question) => {
            const userAnswer = answers.find(a => a.questionId === question._id.toString());
            
            const selectedAnswer = (userAnswer?.selectedAnswer || '').toLowerCase().replace(/\s+/g, ' ').trim();
            const correctAnswer = (question.correctAnswer || '').toLowerCase().replace(/\s+/g, ' ').trim();
            
            const isCorrect = selectedAnswer !== '' && selectedAnswer === correctAnswer;

            if (isCorrect) correctCount++;

            detailedResults.push({
                questionId: question._id,
                question: question.question,
                selectedAnswer: userAnswer?.selectedAnswer || null,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation,
            });
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        res.status(200).json({
            success: true,
            data: {
                score,
                correctAnswers: correctCount,
                totalQuestions: quiz.questions.length,
                detailedResults,
            },
        });
    } catch (error) {
        next(error);
    }
};