

export const createAudioFileFromText = async (text) => {
  try {
    const response = await fetch('http://localhost:3000/api/generate-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Error generating audio file');
    }

    const blob = await response.blob();
    return blob; // Return the URL for the audio file
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error for further handling
  }
};

export const detectText = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/detect-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error detecting text');
    } else {
      console.log("response is ok")
    
    }

    const text = await response.text();
    return text; // Return the detected text
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error for further handling
  }
};