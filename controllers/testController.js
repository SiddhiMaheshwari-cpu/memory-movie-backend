const home = (req, res) => {
    res.status(200).send("Home route working!");
};

const test = (req, res) => {
    res.status(200).send("Test route working!");
};

module.exports = {
    home,
    test,
};