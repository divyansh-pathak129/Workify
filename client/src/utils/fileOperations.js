import fs from 'fs';
import path from 'path';

export const saveSubmission = (submission) => {
  try {
    const filePath = path.join(process.cwd(), 'src/assets/applicationDemoData.json');
    const currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Initialize submissions array if it doesn't exist
    if (!currentData.submissions) {
      currentData.submissions = [];
    }
    
    // Add new submission
    currentData.submissions.push(submission);
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error saving submission:', error);
    return false;
  }
};

export const getSubmissions = () => {
  try {
    const filePath = path.join(process.cwd(), 'src/assets/applicationDemoData.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data.submissions || [];
  } catch (error) {
    console.error('Error reading submissions:', error);
    return [];
  }
};
