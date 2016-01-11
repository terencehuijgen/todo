class CreateTodos < ActiveRecord::Migration
  def change
    create_table :todos do |t|
      t.string :uid
      t.string :content

      t.timestamps null: false
    end
  end
end
