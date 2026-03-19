const fs = require('fs');
const path = require('path');
const glob = require('fs').readdirSync;

const screensDir = path.join(__dirname, 'client', 'screens');
const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(screensDir, file);
  let text = fs.readFileSync(filePath, 'utf8');
  
  // Replace image path
  text = text.replace(/require\(\"..\/..\/attached_assets\/WhatsApp_Image_[^\"]+\"\)/g, 'require("../../assets/images/novo_logo.png")');
  
  // Replace fonts in styles
  text = text.replace(/fontFamily:\s*Fonts\?\.serif/g, 'fontFamily: "Montserrat_700Bold"');
  text = text.replace(/fontFamily:\s*\"[^\"]*serif[^\"]*\"/g, 'fontFamily: "Montserrat_700Bold"');
  
  fs.writeFileSync(filePath, text);
}
console.log('Done replacing logo and fonts');
