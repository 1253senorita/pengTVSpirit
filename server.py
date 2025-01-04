from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class DataModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

@app.route('/addData', methods=['POST'])
def add_data():
    data = request.json
    new_data = DataModel(id=data['id'], name=data['name'])
    db.session.add(new_data)
    db.session.commit()
    return jsonify({"message": "Data saved successfully"}), 200

@app.route('/getData', methods=['GET'])
def get_data():
    data = DataModel.query.all()
    result = [{"id": d.id, "name": d.name} for d in data]
    return jsonify(result)

@app.route('/deleteData/<int:id>', methods=['DELETE'])
def delete_data(id):
    data = DataModel.query.get(id)
    if data:
        db.session.delete(data)
        db.session.commit()
        return jsonify({"message": "Data deleted successfully"}), 200
    return jsonify({"message": "Data not found"}), 404

@app.route('/deleteAllData', methods=['DELETE'])
def delete_all_data():
    try:
        num_rows_deleted = db.session.query(DataModel).delete()
        db.session.commit()
        return jsonify({"message": f"Deleted {num_rows_deleted} rows."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to delete data: {str(e)}"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

