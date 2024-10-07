import axios from 'axios';

// Fonction pour générer du texte via l'API OpenAI
export const generateText = async (prompt: string): Promise<string> => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo', // Utiliser le modèle gpt-3.5-turbo
                messages: [{ role: 'user', content: prompt }], // Structure des messages
                max_tokens: 1000,
                temperature: 0.5
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content.trim(); // Accéder au contenu du message
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Erreur lors de la génération de texte:', error.response ? error.response.data : error.message);
        } else {
            console.error('Erreur inconnue:', error);
        }
        return 'Erreur lors de la génération du texte.';
    }
};
