class SimilarityService {

    cosineSimilarity(vecA, vecB) {

        let dot = 0;
        let magA = 0;
        let magB = 0;

        for (let i = 0; i < vecA.length; i++) {

            dot += vecA[i] * vecB[i];

            magA += vecA[i] * vecA[i];

            magB += vecB[i] * vecB[i];

        }

        magA = Math.sqrt(magA);

        magB = Math.sqrt(magB);

        if (magA === 0 || magB === 0) {
            return 0;
        }

        return dot / (magA * magB);

    }

}

module.exports = new SimilarityService();