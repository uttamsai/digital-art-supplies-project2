// Reuse the same address inputs for account and checkout forms.
export default function AddressFields({ value, onChange, prefix = 'address' }) {
  return (
    <div className="row">
      {['street', 'city', 'state', 'zip'].map((name) => (
        <div className={name === 'street' ? 'col-12 mb-3' : 'col-sm-4 mb-3'} key={name}>
          <label className="form-label" htmlFor={`${prefix}-${name}`}>
            {name === 'zip' ? 'ZIP' : name[0].toUpperCase() + name.slice(1)}
          </label>
          <input
            id={`${prefix}-${name}`}
            className="form-control"
            required
            value={value[name] || ''}
            onChange={(event) => onChange({ ...value, [name]: event.target.value })}
          />
        </div>
      ))}
    </div>
  )
}
