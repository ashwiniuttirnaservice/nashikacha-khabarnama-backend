const sharp = require("sharp");
const fs = require("fs");

const compressImages = async (req, res, next) => {
    try {
        if (!req.files) return next();

        const MAX_SIZE = 100 * 1024; // 100 KB
        const compressPromises = [];

        for (const field in req.files) {
            req.files[field].forEach((file) => {
                if (!file.mimetype.startsWith("image/")) return;

                compressPromises.push(
                    (async () => {
                        const outputPath = file.path.replace(
                            /(\.[\w\d_-]+)$/i,
                            "_compressed.jpg"
                        );

                        let quality = 80;
                        let width = 1600;


                        let buffer = fs.readFileSync(file.path);


                        while (buffer.length > MAX_SIZE) {
                            quality -= 10;

                            if (quality < 30) {
                                width -= 200;
                                quality = 60;
                            }

                            if (width < 400) break;

                            buffer = await sharp(buffer)
                                .resize({ width })
                                .jpeg({ quality })
                                .toBuffer();
                        }


                        await sharp(buffer).toFile(outputPath);


                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }


                        file.path = outputPath;
                        file.size = buffer.length;
                        file.filename = file.filename.replace(
                            /(\.[\w\d_-]+)$/i,
                            "_compressed.jpg"
                        );
                    })()
                );
            });
        }

        await Promise.all(compressPromises);
        next();
    } catch (err) {
        console.error("इमेज कॉम्प्रेशन एरर:", err);
        next();
    }
};

// CommonJS एक्सपोर्ट
module.exports = { compressImages };