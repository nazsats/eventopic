// scripts/replace-toast.js
const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'contexts/AuthContext.tsx',
    'app/dashboard/page.tsx',
    'components/AuthModal.tsx',
    'app/contact/page.tsx',
    'components/ChatBot.tsx',
    'app/profile/page.tsx',
    'app/portal/applications/page.tsx',
    'app/admin/page.tsx',
    'app/portal/applications/[jobId]/page.tsx',
    'components/Navbar.tsx'
];

const replacements = [
    {
        from: /import\s+{\s*toast\s*}\s+from\s+["']react-toastify["'];?/g,
        to: 'import { toast } from "sonner";'
    },
    {
        from: /import\s+{\s*ToastContainer\s*}\s+from\s+["']react-toastify["'];?/g,
        to: ''
    },
    {
        from: /import\s+["']react-toastify\/dist\/ReactToastify\.css["'];?/g,
        to: ''
    }
];

filesToUpdate.forEach(file => {
    const filePath = path.join(process.cwd(), file);

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        replacements.forEach(({ from, to }) => {
            content = content.replace(from, to);
        });

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${file}`);
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('\n✨ Toast replacement complete!');
