const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const archiver = require("archiver");

exports.handler = async (event, context) => {
  // Parsowanie danych z formularza
  const formData = JSON.parse(event.body);

  // Ścieżka do szablonu
  const templatePath = path.resolve(__dirname, "../templates/szablon.html");
  const template = fs.readFileSync(templatePath, "utf8");

  // Renderowanie HTML z danymi
  const htmlContent = mustache.render(template, formData);

  // Tworzenie pliku HTML w pamięci
  const fileName = `formularz_${Date.now()}.html`;
  const filePath = path.join("/tmp", fileName);
  fs.writeFileSync(filePath, htmlContent);

  // Tworzenie pliku ZIP
  const zipFileName = `formularz_${Date.now()}.zip`;
  const zipFilePath = path.join("/tmp", zipFileName);
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);
  archive.file(filePath, { name: fileName });
  await archive.finalize();

  // Odczytanie zawartości ZIP
  const zipBuffer = fs.readFileSync(zipFilePath);

  // Zwrócenie pliku ZIP jako odpowiedzi
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFileName}"`,
    },
    body: zipBuffer.toString("base64"),
    isBase64Encoded: true,
  };
};
