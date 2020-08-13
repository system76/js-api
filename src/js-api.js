const { get, objectNotation } = require('./utility')

function normalize (data, included = [], includes = {}) {
  if (includes != null && Array.isArray(includes)) {
    includes = objectNotation(includes)
  }

  const out = {
    id: data.id,
    type: data.type,
    ...(data.attributes || {})
  }

  for (const [rK, rV] of Object.entries(includes)) {
    const relationship = get(data, `relationships.${rK}`)

    if (relationship == null) {
      // Tried to include something that isn't an actual relationship :shrug:
    } else if (Array.isArray(relationship.data)) {
      out[rK] = relationship.data
        .map((d) => findRelationship(d, included))
        .map((r) => normalize(r, included, rV))
    } else {
      const nestedRecord = findRelationship(relationship.data, included)
      out[rK] = normalize(nestedRecord, included, rV)
    }
  }

  return out
}

function findRelationship ({ id, type }, included) {
  return included.find((record) => {
    return (record.id === id && record.type === type)
  })
}

module.exports = { normalize }
