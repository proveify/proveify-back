import slugEs from "../data/stop-words-es";

const removeAccents = (str: string): string => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const removeStopWords = (str: string): string => {
    const words = str.split(" ");
    const filteredWords = words.filter((word) => !slugEs.includes(word));
    return filteredWords.join(" ");
};

export const generateSlug = (text: string, uniqueIdentifier: string): string => {
    let slug = removeStopWords(text);
    slug = removeAccents(slug);
    slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return slug + "-" + uniqueIdentifier;
};
