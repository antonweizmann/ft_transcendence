FROM postgres:17.2

# Create a directory for custom configuration files
RUN mkdir -p /etc/postgresql/custom

# Copy custom pg_hba.conf file
COPY ./pg_hba.conf /etc/postgresql/custom/pg_hba.conf

# Set permissions for the configuration file
RUN chown postgres:postgres /etc/postgresql/custom/pg_hba.conf && \
    chmod 600 /etc/postgresql/custom/pg_hba.conf

# Copy the custom entrypoint script
COPY ./custom-entrypoint.sh /usr/local/bin/custom-entrypoint.sh

# Set permissions for the script
RUN chmod +x /usr/local/bin/custom-entrypoint.sh

# Override the default entrypoint
ENTRYPOINT ["custom-entrypoint.sh"]
