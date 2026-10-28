const fs = require("fs");
const path = require("path");

const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const officeParser = require("officeparser");
const Tesseract = require("tesseract.js");

class AttachmentTextRepository {

    async getAttachmentText(files) {

        let extractedText = "";

        for (const file of files) {

            try {

                const filePath = file.file_path;

                const extension =
                    path.extname(filePath).toLowerCase();

                switch (extension) {

                    case ".txt":

                        extractedText +=
                            await this.readTxt(filePath);

                        break;

                    case ".pdf":

                        extractedText +=
                            await this.readPdf(filePath);

                        break;

                    case ".docx":

                        extractedText +=
                            await this.readDocx(filePath);

                        break;

                    case ".pptx":

                        extractedText +=
                            await this.readPptx(filePath);

                        break;

                    case ".png":

                    case ".jpg":

                    case ".jpeg":

                        extractedText +=
                            await this.readImage(filePath);

                        break;

                    default:

                        console.log(
                            "Unsupported file:",
                            extension
                        );

                }

                extractedText += "\n\n";

            }

            catch (error) {

                console.log(

                    "Attachment Error:",

                    error.message

                );

            }

        }

        return extractedText;

    }

    async readTxt(filePath){

        return fs.readFileSync(
            filePath,
            "utf8"
        );

    }

    async readPdf(filePath){

        const buffer =
            fs.readFileSync(filePath);

        const data =
            await pdf(buffer);

        return data.text;

    }

    async readDocx(filePath){

        const result =
            await mammoth.extractRawText({

                path:filePath

            });

        return result.value;

    }

    async readPptx(filePath){

        const document = await officeParser.parseOffice(
            filePath
        );
        const text = await document.to("text");

        return text.value;

    }

    async readImage(filePath){

        const result =
            await Tesseract.recognize(

                filePath,

                "eng"

            );

        return result.data.text;

    }

}

module.exports =
new AttachmentTextRepository();