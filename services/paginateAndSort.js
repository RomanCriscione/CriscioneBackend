const paginateAndSort = (data, { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'asc' }) => {
    // Ordenamiento
    const sortedData = data.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a[sortField] > b[sortField] ? 1 : -1;
        } else {
            return a[sortField] < b[sortField] ? 1 : -1;
        }
    });

    // Paginación
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedData = sortedData.slice(startIndex, endIndex)

    return {
        data: paginatedData,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / limit),
        currentPage: page,
    };
};

module.exports = paginateAndSort
