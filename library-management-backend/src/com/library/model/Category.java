package com.library.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Model representing a book category / genre in the library.
 */
public class Category implements Serializable {

    private static final long serialVersionUID = 1L;

    private int id;
    private String name;
    private String description;

    // Default Constructor
    public Category() {
    }

    // Constructor without ID (for creation)
    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Full Parameterized Constructor
    public Category(int id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return id == category.id && Objects.equals(name, category.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }

    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
