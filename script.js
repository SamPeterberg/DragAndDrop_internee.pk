// Handles drag & drop, file validation, preview, and progress

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileElem');
const progress = document.getElementById('progress');
const errorMsg = document.getElementById('error');
const preview = document.getElementById('preview');

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Allow multiple files
fileInput.setAttribute('multiple', 'multiple');
fileInput.setAttribute('accept', [
  'image/jpeg,image/png,image/gif,application/pdf,text/plain,.doc,.docx'
].join(','));

let uploadedFiles = [];

function showError(message) {
  errorMsg.textContent = message;
  progress.classList.add('hidden');
}

function clearError() {
  errorMsg.textContent = '';
}

function getFileIcon(type, name) {
  if (type.startsWith('image/')) {
    return null; // Will use preview
  }
  if (type === 'application/pdf') {
    return '📄';
  }
  if (type === 'text/plain') {
    return '📄';
  }
  if (
    type === 'application/msword' ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.doc') || name.endsWith('.docx')
  ) {
    return '📝';
  }
  return '📁';
}

function renderPreviews() {
  preview.innerHTML = '';
  uploadedFiles.forEach((fileObj, idx) => {
    const file = fileObj.file;
    const wrapper = document.createElement('div');
    wrapper.className = 'relative flex flex-col items-center m-2';

    let content;
    if (file.type.startsWith('image/')) {
      content = document.createElement('img');
      content.className = 'max-h-32 max-w-32 rounded shadow mb-2';
      content.alt = file.name;
      const reader = new FileReader();
      reader.onload = function(e) {
        content.src = e.target.result;
      };
      reader.readAsDataURL(file);
      wrapper.appendChild(content);
    } else {
      const icon = document.createElement('div');
      icon.className = 'text-5xl mb-2';
      icon.textContent = getFileIcon(file.type, file.name);
      wrapper.appendChild(icon);
    }

    // File name
    const nameDiv = document.createElement('div');
    nameDiv.className = 'text-xs text-gray-700 break-all text-center max-w-[8rem]';
    nameDiv.textContent = file.name;
    wrapper.appendChild(nameDiv);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'Remove';
    removeBtn.onclick = () => {
      uploadedFiles.splice(idx, 1);
      renderPreviews();
    };
    wrapper.appendChild(removeBtn);

    preview.appendChild(wrapper);
  });
}

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|pdf|txt|doc|docx)$/i)) {
    showError('Invalid file type. Only images, PDF, TXT, DOC, DOCX allowed.');
    return false;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    showError('File is too large. Max size is 5 MB.');
    return false;
  }
  return true;
}

function simulateUpload(files) {
  progress.value = 0;
  progress.classList.remove('hidden');
  let percent = 0;
  const interval = setInterval(() => {
    percent += Math.random() * 30;
    if (percent >= 100) {
      percent = 100;
      clearInterval(interval);
      progress.classList.add('hidden');
      renderPreviews();
    }
    progress.value = percent;
  }, 150);
}

function handleFiles(files) {
  clearError();
  if (!files || files.length === 0) return;
  let validFiles = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (validateFile(file)) {
      validFiles.push({ file });
    }
  }
  if (validFiles.length > 0) {
    uploadedFiles = uploadedFiles.concat(validFiles);
    simulateUpload(validFiles);
  }
}

// Drag & Drop Events
['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('border-blue-600', 'text-blue-700');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('border-blue-600', 'text-blue-700');
  });
});

dropArea.addEventListener('drop', e => {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
});

// Click to open file dialog
dropArea.addEventListener('click', () => {
  fileInput.value = ''; // Reset so same file can be selected again
  fileInput.click();
});

fileInput.addEventListener('change', e => {
  handleFiles(e.target.files);
});